const dotenv = require('dotenv');
const path = require('path');
const Joi = require('@hapi/joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid('production', 'development', 'test')
			.required(),
		PORT: Joi.number().default(3000),

		JWT_SECRET: Joi.string().required().description('JWT secret key'),
		JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
			.default(30)
			.description('minutes after which access tokens expire'),
		JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
			.default(30)
			.description('days after which refresh tokens expire'),

		COOKIE_EXPIRATION_HOURS: Joi.number()
			.default(24)
			.description('hours after which httpOnly cookie expire'),

		SQL_USERNAME: Joi.string().description('sqldb username'),
		SQL_HOST: Joi.string().description('sqldb host'),
		SQL_DATABASE_NAME: Joi.string().description('sqldb database name'),
		SQL_PASSWORD: Joi.string().description('sqldb password'),
		SQL_DIALECT: Joi.string()
			.default('postgres')
			.description('type of sqldb'),
		SQL_MAX_POOL: Joi.number()
			.default(10)
			.min(5)
			.description('sqldb max pool connection'),
		SQL_MIN_POOL: Joi.number()
			.default(0)
			.min(0)
			.description('sqldb min pool connection'),
		SQL_IDLE: Joi.number()
			.default(10000)
			.description('sqldb max pool idle time in miliseconds'),

		SMTP_HOST: Joi.string().description('server that will send the emails'),
		SMTP_PORT: Joi.number().description(
			'port to connect to the email server'
		),
		SMTP_USERNAME: Joi.string().description('username for email server'),
		SMTP_PASSWORD: Joi.string().description('password for email server'),
		EMAIL_FROM: Joi.string().description(
			'the from field in the emails sent by the app'
		),

		// brevo details
		BREVO_SMTP_HOST: Joi.string().description('BREVO SMTP host'),
		BREVO_SMTP_PORT: Joi.number().description('BREVO SMTP port'),
		BREVO_SMTP_USER: Joi.string().description('BREVO SMTP user'),
		BREVO_SMTP_PASS: Joi.string().description('BREVO SMTP password'),
		BREVO_SENDER_EMAIL: Joi.string().description('BREVO SENDER EMAIL'),
		BREVO_SENDER_NAME: Joi.string().description('BREVO SENDER NAME'),

		// ccl details
		CCL_API_KEY: Joi.string().description('CCL API KEY'),
		CCL_CLIENTS: Joi.string().description('CCL CLIENTS'),
		WEBSITE_URL: Joi.string().description('Website base URL'),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: 'key' } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	pagination: {
		limit: 20,
		page: 1,
	},
	jwt: {
		secret: envVars.JWT_SECRET,
		accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
		resetPasswordExpirationMinutes: 10,
	},
	cookie: {
		cookieExpirationHours: envVars.COOKIE_EXPIRATION_HOURS,
	},
	sqlDB: {
		username: envVars.SQL_USERNAME,
		user: envVars.SQL_USERNAME,
		host: envVars.SQL_HOST,
		database: envVars.SQL_DATABASE_NAME,
		password: envVars.SQL_PASSWORD,
		dialect: envVars.SQL_DIALECT,
		// logging: console.warn,
		pool: {
			max: envVars.SQL_MAX_POOL,
			min: envVars.SQL_MIN_POOL,
			idle: envVars.SQL_IDLE,
		},
		define: {
			/**
			 * All tables won't have "createdAt" and "updatedAt" Auto fields.
			 * References: https://sequelize.org/master/manual/model-basics.html#timestamps
			 */
			timestamps: false,
			// Table names won't be pluralized.
			freezeTableName: true,
			// Column names will be underscored.
			underscored: true,
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
	email: {
		smtp: {
			host: envVars.SMTP_HOST,
			port: envVars.SMTP_PORT,
			auth: {
				user: envVars.SMTP_USERNAME,
				pass: envVars.SMTP_PASSWORD,
			},
		},
		from: envVars.EMAIL_FROM,
	},
	brevoEmail: {
		host: envVars.BREVO_SMTP_HOST,
		port: envVars.BREVO_SMTP_PORT,
		auth: {
			user: envVars.BREVO_SMTP_USER,
			pass: envVars.BREVO_SMTP_PASS,
		},
		from: `"${envVars.BREVO_SENDER_NAME}" <${envVars.BREVO_SENDER_EMAIL}>`,
	},
	cclCourier: {
		apiKey: envVars.CCL_API_KEY,
		clients: envVars.CCL_CLIENTS,
	},
	websiteUrl: envVars.WEBSITE_URL || 'http://localhost:3000',
	s3Bucket: {
		accessKeyId: envVars.AWS_ACCESS_KEY_ID,
		secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
		region: envVars.AWS_REGION,
		Bucket: envVars.S3_BUCKET,
	},
	cloudinary: {
		cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
		api_key: envVars.CLOUDINARY_API_KEY,
		api_secret: envVars.CLOUDINARY_API_SECRET,
	},
};
