async function mediaUpload(file, subFolder) {
	if (!file) throw new Error('No file provided');
	// console.log('Uploading file to R2:', file.originalname);
	return {
		url: file.key, // 🔥 R2 CDN URL
		// url: file.location, // 🔥 R2 CDN URL
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
const {
	S3Client,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand,
} = require('@aws-sdk/client-s3');
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
		'/uploads/' + path.relative(UPLOAD_DIR, filePath).replace(/\\/g, '/');

	try {
		const existingMedia = await db.media.findOne({
			where: { url: oldDbPath },
		});

		// 🔄 CHANGED: treat as skipped instead of "not found"
		if (!existingMedia) {
			stats.skipped++; // ✅ CHANGED
			return;
		}

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

		// if (stats.uploaded % 50 === 0) {
		// 	console.log(`🚀 Progress: ${stats.uploaded}/${stats.total}`);
		// }
		// 🔄 CHANGED: better progress tracking (processed instead of uploaded)
		if ((stats.uploaded + stats.skipped) % 50 === 0) {
			console.log(
				`🚀 Progress: ${
					stats.uploaded + stats.skipped + stats.failed
				}/${stats.total}`
			);
		}
	} catch (err) {
		stats.failed++;
		console.error(`❌ Failed: ${filePath}`, err.message);
	}
}
// 🔥 MAIN MIGRATION FUNCTION
async function migrate() {
	const pLimit = (await import('p-limit')).default;
	const limit = pLimit(10);
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

async function fixImageNamesAndConvertToWebP() {
	const sharp = require('sharp');
	const path = require('path');
	const slugify = require('slugify');

	const {
		S3Client,
		PutObjectCommand,
		GetObjectCommand,
		DeleteObjectCommand,
	} = require('@aws-sdk/client-s3');

	const db = require('../db/models');

	// R2 Client
	const s3 = new S3Client({
		region: 'auto',
		endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY,
			secretAccessKey: process.env.R2_SECRET_KEY,
		},
	});

	const BUCKET = process.env.R2_BUCKET_NAME;

	// clean filename
	function cleanFileName(name) {
		const base = name.replace(/\.[^/.]+$/, '');

		return (
			slugify(base, {
				lower: true,
				strict: true,
				trim: true,
			}) + '.webp'
		);
	}

	// stream -> buffer
	async function streamToBuffer(stream) {
		return new Promise((resolve, reject) => {
			const chunks = [];

			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	const medias = await db.media.findAll({
		attributes: ['id', 'url'],
	});

	console.log(`📦 Found ${medias.length} images`);

	for (const media of medias) {
		try {
			if (!media.url) continue;

			const oldKey = media.url.replace(/^\/+/, '');

			const ext = path.extname(oldKey).toLowerCase();

			const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

			if (!allowed.includes(ext)) continue;

			const dir = path.dirname(oldKey);
			const fileName = path.basename(oldKey);

			const cleanedName = cleanFileName(fileName);

			const newKey = dir === '.' ? cleanedName : `${dir}/${cleanedName}`;

			// already correct
			if (oldKey === newKey && ext === '.webp') {
				continue;
			}

			console.log(`🔄 Processing: ${oldKey}`);

			// get old image from R2
			const file = await s3.send(
				new GetObjectCommand({
					Bucket: BUCKET,
					Key: oldKey,
				})
			);

			const inputBuffer = await streamToBuffer(file.Body);

			// convert to webp
			const outputBuffer = await sharp(inputBuffer)
				.webp({ quality: 80 })
				.toBuffer();

			// upload new image
			await s3.send(
				new PutObjectCommand({
					Bucket: BUCKET,
					Key: newKey,
					Body: outputBuffer,
					ContentType: 'image/webp',
				})
			);

			// update DB
			await db.media.update(
				{ url: newKey },
				{
					where: {
						id: media.id,
					},
				}
			);

			// delete old file
			if (oldKey !== newKey) {
				await s3.send(
					new DeleteObjectCommand({
						Bucket: BUCKET,
						Key: oldKey,
					})
				);
			}

			console.log(`✅ Done: ${newKey}`);
		} catch (err) {
			console.log(`❌ Failed: ${media.url}`);
			console.log(err.message);
		}
	}

	console.log('🎉 All done');
}

const RESIZE_DIMENSION = 280;
const PREFIX = 'sm-image-';
const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
});

async function resizeR2Images() {
	const {
		S3Client,
		ListObjectsV2Command,
		GetObjectCommand,
		PutObjectCommand,
		HeadObjectCommand,
	} = require('@aws-sdk/client-s3');
	try {
		console.log('🚀 Starting R2 image resize process...');
		console.log(`📦 Bucket: ${BUCKET}`);
		console.log(
			`📐 Target dimension: ${RESIZE_DIMENSION}x${RESIZE_DIMENSION}`
		);
		console.log(`🔤 Prefix: ${PREFIX}\n`);

		const allObjects = [];
		let continuationToken = undefined;

		// ✅ Handle pagination (S3 returns max 1000 objects per request)
		console.log('📋 Listing all objects in bucket...');
		do {
			const listParams = {
				Bucket: BUCKET,
				ContinuationToken: continuationToken,
			};

			const command = new ListObjectsV2Command(listParams);
			const response = await s3Client.send(command);

			if (response.Contents) {
				allObjects.push(...response.Contents);
			}

			continuationToken = response.NextContinuationToken;
			console.log(
				`   Found ${response.Contents?.length || 0} objects...`
			);
		} while (continuationToken);

		if (allObjects.length === 0) {
			console.log('❌ No images found in bucket');
			return;
		}

		// ✅ Filter image files only
		const imageFiles = allObjects.filter((obj) => {
			const ext = path.extname(obj.Key).toLowerCase();
			return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
		});

		console.log(`✅ Total objects in bucket: ${allObjects.length}`);
		console.log(`📸 Image files to process: ${imageFiles.length}\n`);

		let successCount = 0;
		let errorCount = 0;
		let skippedCount = 0;

		// ✅ Process each image
		for (const [index, file] of imageFiles.entries()) {
			try {
				// Skip if already resized version exists
				if (file.Key.includes(PREFIX)) {
					console.log(
						`⏭️  [${index + 1}/${imageFiles.length}] SKIP: ${
							file.Key
						} (already resized)`
					);
					skippedCount++;
					continue;
				}
				// ✅ NEW - checks if sm-image- version exists in R2
				const ext = path.extname(file.Key);
				const nameWithoutExt = file.Key.substring(
					0,
					file.Key.lastIndexOf('.')
				);
				const newKey = `${PREFIX}${nameWithoutExt}${ext}`;

				try {
					const headCommand = new HeadObjectCommand({
						Bucket: BUCKET,
						Key: newKey,
					});
					await s3Client.send(headCommand);

					// File exists, skip it
					console.log(
						`⏭️  [${index + 1}/${imageFiles.length}] SKIP: ${
							file.Key
						} (sm- version exists)`
					);
					skippedCount++;
					continue;
				} catch (err) {
					// File doesn't exist, continue processing
					if (err.name !== 'NotFound') throw err;
				}

				console.log(
					`⏳ [${index + 1}/${imageFiles.length}] Processing: ${
						file.Key
					}`
				);

				// ✅ Download original image from R2
				const getCommand = new GetObjectCommand({
					Bucket: BUCKET,
					Key: file.Key,
				});

				const response = await s3Client.send(getCommand);

				// Convert stream to buffer
				const originalBuffer = await streamToBuffer(response.Body);
				console.log(
					`   ✓ Downloaded (${(originalBuffer.length / 1024).toFixed(
						2
					)} KB)`
				);

				// ✅ Resize image to 280x280
				const resizedBuffer = await sharp(originalBuffer)
					.resize(RESIZE_DIMENSION, RESIZE_DIMENSION, {
						fit: 'cover', // ✅ Changed from 'contain' to 'cover'
						position: 'center',
						background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
					})
					.webp({ quality: 80 }) // Convert to WebP for better compression
					.toBuffer();

				console.log(
					`   ✓ Resized to ${RESIZE_DIMENSION}x${RESIZE_DIMENSION} (${(
						resizedBuffer.length / 1024
					).toFixed(2)} KB)`
				);

				// ✅ Generate new key with prefix
				// const ext = path.extname(file.Key);
				// const nameWithoutExt = file.Key.substring(
				// 	0,
				// 	file.Key.lastIndexOf('.')
				// );
				// const newKey = `${PREFIX}${nameWithoutExt}${ext}`;

				// ✅ Upload resized image back to R2
				const uploadCommand = new PutObjectCommand({
					Bucket: BUCKET,
					Key: newKey,
					Body: resizedBuffer,
					ContentType: 'image/webp', // ✅ Set to webp since we converted it
					CacheControl: 'public, max-age=31536000', // 1 year cache
					Metadata: {
						'original-key': file.Key,
						'resized-at': new Date().toISOString(),
					},
				});

				await s3Client.send(uploadCommand);
				console.log(`   ✓ Uploaded as: ${newKey}\n`);

				successCount++;
			} catch (error) {
				console.error(
					`   ❌ Error processing ${file.Key}: ${error.message}\n`
				);
				errorCount++;
			}
		}

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✅ RESIZE COMPLETE');
		console.log('='.repeat(60));
		console.log(`✓ Successful: ${successCount}`);
		console.log(`✗ Errors: ${errorCount}`);
		console.log(`⏭️  Skipped: ${skippedCount}`);
		console.log('='.repeat(60));
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	}
}

/**
 * Convert Node.js stream to buffer
 * ✅ Needed because AWS SDK v3 returns a readable stream
 */
async function streamToBuffer(stream) {
	const chunks = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks)));
	});
}

module.exports = {
	mediaUpload,
	migrate,
	fixImageNamesAndConvertToWebP,
	resizeR2Images,
};
