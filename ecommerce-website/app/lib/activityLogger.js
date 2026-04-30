/**
 * activityLogger.js
 *
 * Sends structured activity events to BE.
 * On failure → queues in IndexedDB → auto-syncs on reconnect / next page load.
 *
 * Usage:
 *   import { logActivity, syncOfflineQueue } from '@/lib/activityLogger';
 *
 *   logActivity({
 *     eventType: 'order_placed',
 *     customer:  formData,           // name, email, phone, address, city, ...
 *     items:     cart,               // raw cart array — normalised in BE service
 *     summary:   { subtotal, shipping, total },
 *     orderTrackingId: 'TRK-123',
 *     payload:   { billingAddress }, // anything extra
 *   });
 */

const DB_NAME      = 'activity_queue_db';
const STORE_NAME   = 'activity_queue';
const DB_VERSION   = 1;
const API_BASE     = process.env.NEXT_PUBLIC_API_BASE_URL;
const MAX_RETRIES  = 3;
const SYNC_DEBOUNCE_MS = 3000;

// ─── Stable anonymous session ID ─────────────────────────────────────────────
function getSessionId() {
	if (typeof window === 'undefined') return null;
	let sid = localStorage.getItem('_act_session_id');
	if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('_act_session_id', sid); }
	return sid;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
let _db = null;
async function openDB() {
	if (_db) return _db;
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains(STORE_NAME))
				db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
		};
		req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
		req.onerror   = () => reject(req.error);
	});
}
async function idbAdd(event) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).add(event);
		tx.oncomplete = resolve;
		tx.onerror    = () => reject(tx.error);
	});
}
async function idbGetAll() {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx  = db.transaction(STORE_NAME, 'readonly');
		const req = tx.objectStore(STORE_NAME).getAll();
		req.onsuccess = () => resolve(req.result);
		req.onerror   = () => reject(req.error);
	});
}
async function idbClearKeys(localIds) {
	if (!localIds?.length) return;
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx    = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		localIds.forEach((id) => store.delete(id));
		tx.oncomplete = resolve;
		tx.onerror    = () => reject(tx.error);
	});
}

// ─── Core log function ────────────────────────────────────────────────────────
/**
 * @param {object} data
 * @param {string}      data.eventType
 * @param {object}      [data.customer]         - formData from checkout
 * @param {object}      [data.billingAddress]   - only when different from shipping
 * @param {Array}       [data.items]            - cart array
 * @param {object}      [data.summary]          - { subtotal, shipping, total }
 * @param {string}      [data.orderTrackingId]
 * @param {object}      [data.payload]          - anything extra (error info etc.)
 */
export async function logActivity(data) {
	if (typeof window === 'undefined') return;

	const event = {
		...data,
		sessionId:       getSessionId(),
		pageUrl:         data.pageUrl ?? window.location.href,
		clientTimestamp: new Date().toISOString(),
	};

	let sent = false;
	for (let i = 0; i < MAX_RETRIES && !sent; i++) {
		try {
			const res = await fetch(`${API_BASE}/activity/log`, {
				method:      'POST',
				headers:     { 'Content-Type': 'application/json' },
				credentials: 'include',
				body:        JSON.stringify(event),
				signal:      AbortSignal.timeout(5000),
			});
			if (res.ok) sent = true;
		} catch (_) {}
	}

	if (!sent) {
		try {
			await idbAdd(event);
		} catch (_) {
			try {
				const fb = JSON.parse(localStorage.getItem('_act_fallback') || '[]');
				fb.push(event);
				localStorage.setItem('_act_fallback', JSON.stringify(fb));
			} catch (_) {}
		}
	}
}

// ─── Offline sync ─────────────────────────────────────────────────────────────
let _syncInProgress = false;
export async function syncOfflineQueue() {
	if (typeof window === 'undefined' || _syncInProgress) return;

	let idbIds = [], idbEvents = [], lsEvents = [];
	try {
		const rows = await idbGetAll();
		idbIds    = rows.map((r) => r.localId);
		idbEvents = rows.map(({ localId, ...rest }) => rest);
	} catch (_) {}
	try { lsEvents = JSON.parse(localStorage.getItem('_act_fallback') || '[]'); } catch (_) {}

	const all = [...idbEvents, ...lsEvents];
	if (!all.length) return;

	_syncInProgress = true;
	try {
		const res = await fetch(`${API_BASE}/activity/sync`, {
			method:      'POST',
			headers:     { 'Content-Type': 'application/json' },
			credentials: 'include',
			body:        JSON.stringify({ events: all }),
			signal:      AbortSignal.timeout(15000),
		});
		if (res.ok) {
			await idbClearKeys(idbIds);
			localStorage.removeItem('_act_fallback');
		}
	} catch (_) {}
	finally { _syncInProgress = false; }
}

// ─── Auto-sync on reconnect ───────────────────────────────────────────────────
if (typeof window !== 'undefined') {
	let t = null;
	window.addEventListener('online', () => {
		clearTimeout(t);
		t = setTimeout(syncOfflineQueue, SYNC_DEBOUNCE_MS);
	});
}
