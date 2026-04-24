async function mediaUpload(file, subFolder) {
	if (!file) throw new Error('No file provided');
	// console.log('Uploading file to R2:', file.originalname);
	return {
		url: file.location, // 🔥 R2 CDN URL
		title: file.originalname,
		size: file.size,
		filename: file.key, // path inside bucket
	};
}

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const slugify = require('slugify');
const mime = require('mime-types');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const db = require('../db/models');

// 🔐 R2 CONFIG
const s3 = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
});

const BUCKET = process.env.R2_BUCKET_NAME;

// 📁 LOCAL UPLOAD FOLDER
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// ✅ Clean filename
function cleanFileName(name, ext) {
	const base = name.replace(/\.[^/.]+$/, '');

	const clean = slugify(base, {
		lower: true,
		strict: true,
	});

	return `${clean}.${ext}`;
}

// 🔥 Process image
async function processImage(filePath) {
	const buffer = fs.readFileSync(filePath);
	let image = sharp(buffer);

	const metadata = await image.metadata();
	const isSquare = metadata.width === metadata.height;

	// Resize if square and > 800
	if (isSquare && metadata.width > 800) {
		image = image.resize(800, 800);
	}

	// Convert to WebP + compress
	const outputBuffer = await image.webp({ quality: 80 }).toBuffer();

	return {
		buffer: outputBuffer,
		ext: 'webp',
		mime: 'image/webp',
	};
}

// 🚀 Upload to R2
async function uploadToR2(buffer, key, contentType) {
	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		})
	);

	return `https://${BUCKET}.r2.dev/${key}`;
}

// 📂 Recursively get all files
function getAllFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			results = results.concat(getAllFiles(filePath));
		} else {
			results.push(filePath);
		}
	});

	return results;
}

async function updateMediaInDB(oldPath, newUrl) {
	await db.media.update(
		{ url: newUrl },
		{
			where: {
				url: oldPath,
			},
		}
	);
}
import pLimit from 'p-limit';

const limit = pLimit(10);

const stats = {
	total: 0,
	uploaded: 0,
	skipped: 0,
	failed: 0,
	dbUpdated: 0,
	dbNotFound: 0,
	dbUpdateMiss: 0, // 👈 add this
};

// helper function
async function processFile(filePath) {


	const oldDbPath =
		'uploads/' + path.relative(UPLOAD_DIR, filePath).replace(/\\/g, '/');

	try {
		const existingMedia = await db.media.findOne({
			where: { url: oldDbPath },
		});

		if (!existingMedia) {
			stats.dbNotFound++;
			console.log(`⏭ Not in DB: ${oldDbPath}`);
			return;
		}

		const ext = path.extname(filePath).toLowerCase();
		const fileName = path.basename(filePath);

		const relativePath = path
			.relative(UPLOAD_DIR, path.dirname(filePath))
			.replace(/\\/g, '/');

		const mimeType = mime.lookup(filePath);

		let finalBuffer;
		let finalExt;
		let contentType;

		if (mimeType && mimeType.startsWith('video/')) {
			finalBuffer = fs.readFileSync(filePath);
			finalExt = ext.replace('.', '');
			contentType = mimeType;
		} else if (mimeType && mimeType.startsWith('image/')) {
			const processed = await processImage(filePath);

			finalBuffer = processed.buffer;
			finalExt = processed.ext;
			contentType = processed.mime;
		} else {
			stats.skipped++;
			console.log(`⏭ Skipped unsupported: ${fileName}`);
			return;
		}

		const newName = cleanFileName(fileName, finalExt);
		const key = relativePath ? `${relativePath}/${newName}` : newName;

		const url = await uploadToR2(finalBuffer, key, contentType);

		stats.uploaded++;

		const [updatedCount] = await db.media.update(
			{ url: key },
			{ where: { url: oldDbPath } }
		);

		if (updatedCount > 0) {
			stats.dbUpdated++;
		} else {
			stats.dbUpdateMiss++;
		}

		if (stats.uploaded % 50 === 0) {
			console.log(`🚀 Progress: ${stats.uploaded}/${stats.total}`);
		}
	} catch (err) {
		stats.failed++;
		console.error(`❌ Failed: ${filePath}`, err.message);
	}
}
// 🔥 MAIN MIGRATION FUNCTION
async function migrate() {
	const files = getAllFiles(UPLOAD_DIR);

	console.log(`📦 Found ${files.length} files`);

	const tasks = files.map((filePath) => limit(() => processFile(filePath)));

	await Promise.all(tasks);

	console.log('🎉 Migration completed');
	console.log('\n📊 MIGRATION REPORT');
	console.log('---------------------------');
	console.log(`Total Files:        ${files.length}`);
	console.log(`Uploaded:           ${stats.uploaded}`);
	console.log(`DB Updated:         ${stats.dbUpdated}`);
	console.log(`Skipped:            ${stats.skipped}`);
	console.log(`DB Not Found:       ${stats.dbNotFound}`);
	console.log(`Failed:             ${stats.failed}`);
	console.log(`DB Update Miss:     ${stats.dbUpdateMiss}`);
	console.log('---------------------------');
}
// RUN
// migrate();

module.exports = {
	mediaUpload,
	migrate,
};
