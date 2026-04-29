const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

// R2 CONFIG
const s3 = new S3Client({
	region: 'auto',
	endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY,
		secretAccessKey: process.env.R2_SECRET_KEY,
	},
});

const upload = multer({
	storage: multerS3({
		s3: s3,
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

module.exports = upload;
