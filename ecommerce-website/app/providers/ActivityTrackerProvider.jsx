'use client';

/**
 * ActivityTrackerProvider.jsx
 *
 * Mount this ONCE near the top of your component tree (e.g. inside AppProviders).
 * It:
 *  1. Syncs any offline queue on mount (catches events stored during a previous
 *     session where BE was down).
 *  2. Does nothing else — the online-reconnect listener is wired in activityLogger.js.
 */

import { useEffect } from 'react';
import { syncOfflineQueue } from '@/app/lib/activityLogger';

export default function ActivityTrackerProvider({ children }) {
	useEffect(() => {
		syncOfflineQueue();
	}, []);

	return children;
}
