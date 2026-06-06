const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const PREFIX = 'sm-image-'; // Prefix for thumbnail images

// R2 CONFIG
const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
});

// ✅ Create upload middleware factory
const createUpload = (fieldName = 'image') => {
	return multer({
		storage: multerS3({
			s3: s3Client,
			bucket: process.env.R2_BUCKET_NAME,
			contentType: multerS3.AUTO_CONTENT_TYPE,

			key: (req, file, cb) => {
				let folderPath = '';

				if (req.body.subFolder) {
					folderPath = req.body.subFolder.replace(/\\/g, '/');
				}

				// Append timestamp to stem to prevent same-name overwrites
				const ext = file.originalname.includes('.')
					? '.' + file.originalname.split('.').pop()
					: '';
				const stem = file.originalname.slice(
					0,
					file.originalname.length - ext.length
				);
				const fileName = `${stem}-${Date.now()}${ext}`;

				const fullPath = folderPath
					? `${folderPath}/${fileName}`
					: fileName;

				console.log('📤 Uploading file to R2:', {
					originalName: file.originalname,
					mimeType: file.mimetype,
					path: fullPath,
				});

				cb(null, fullPath);
			},
		}),
		limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
	});
};

/**
 * ✅ Create and upload thumbnail
 */
async function createAndUploadThumbnail(originalFile) {
	const mimeType = originalFile.mimetype;

	// Only process images
	if (!mimeType.startsWith('image/')) {
		console.log('⏭️  Skipping thumbnail - not an image:', mimeType);
		return null;
	}

	try {
		console.log('🖼️  Creating thumbnail for:', originalFile.key);

		// ✅ Download the original file from R2 to get buffer
		const getCommand = new GetObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: originalFile.key,
		});

		const response = await s3Client.send(getCommand);

		// ✅ Convert stream to buffer
		const chunks = [];
		for await (const chunk of response.Body) {
			chunks.push(chunk);
		}
		const fileBuffer = Buffer.concat(chunks);

		// ✅ Resize and create thumbnail
		const thumbnailBuffer = await sharp(fileBuffer)
			.resize(280, 280, {
				fit: 'cover',
				position: 'center',
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			})
			.webp({ quality: 80 })
			.toBuffer();

		// ✅ Generate thumbnail key with sm- prefix
		const originalKey = originalFile.key;
		const lastSlashIndex = originalKey.lastIndexOf('/');
		const folderPath =
			lastSlashIndex !== -1
				? originalKey.substring(0, lastSlashIndex + 1)
				: '';
		const fileName =
			lastSlashIndex !== -1
				? originalKey.substring(lastSlashIndex + 1)
				: originalKey;

		const thumbnailKey = `${folderPath}${PREFIX}${fileName}`;

		console.log('📤 Uploading thumbnail to R2:', thumbnailKey);

		// ✅ Upload thumbnail to R2
		const uploadCommand = new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: thumbnailKey,
			Body: thumbnailBuffer,
			ContentType: 'image/webp',
			CacheControl: 'public, max-age=31536000',
			Metadata: {
				'original-key': originalKey,
				'created-at': new Date().toISOString(),
				thumbnail: 'true',
			},
		});

		await s3Client.send(uploadCommand);
		console.log('✅ Thumbnail created successfully:', thumbnailKey);

		// ✅ Return thumbnail URL
		const baseUrl = process.env.CDN_URL || 'https://cdn.babiesnbaba.com';
		return `${baseUrl}/${thumbnailKey}`;
	} catch (error) {
		console.error('❌ Error creating thumbnail:', error);
		// Don't throw - let upload succeed even if thumbnail fails
		return null;
	}
}

/**
 * ✅ Create middleware with thumbnail creation
 * Accepts field name as parameter
 */
const withThumbnailCreation = (fieldName = 'image') => {
	const uploadMiddleware = createUpload(fieldName);

	return (req, res, next) => {
		uploadMiddleware.single(fieldName)(req, res, async (err) => {
			if (err) {
				console.error('❌ Upload error:', err.message);
				return res.status(400).json({ error: err.message });
			}

			if (!req.file) {
				console.log('⏭️  No file uploaded');
				return next();
			}

			try {
				// ✅ Create thumbnail in background (don't await)
				const thumbnailUrl = await createAndUploadThumbnail(req.file);

				// ✅ Store both URLs in request object
				const baseUrl = process.env.CDN_URL || 'https://cdn.babiesnbaba.com';
				req.file.originalUrl = `${baseUrl}/${req.file.key}`;
				req.file.thumbnailUrl = thumbnailUrl;

				console.log('✅ Upload complete with thumbnail');
			} catch (error) {
				console.error('❌ Thumbnail creation error:', error);
				// Don't fail the upload if thumbnail fails
				const baseUrl = process.env.CDN_URL || 'https://cdn.babiesnbaba.com';
				req.file.originalUrl = `${baseUrl}/${req.file.key}`;
				req.file.thumbnailUrl = null;
			}

			next();
		});
	};
};

// ✅ Export for backward compatibility
const upload = createUpload('image');

module.exports = {
	upload,
	withThumbnailCreation,
	createUpload,
};
