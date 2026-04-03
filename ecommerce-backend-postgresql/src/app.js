const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');
const { postgres } = require('./config/postgres');
const config = require('./config/config');
const morgan = require('./config/morgan');
const jwt = require('./config/jwt');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const responseFormatter = require('./middlewares/responseFormatter');
const executeCronJobs = require('./utils/cron');
const setUserMiddleware = require('./middlewares/setUserMiddleware');
const path = require('path');

const app = express();

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

// use this middlware to show images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
	'/uploads',
	express.static(path.join(__dirname, 'uploads'), {
		setHeaders: (res, path) => {
			res.set('X-Served-By', 'NodeJS');
		},
	})
);
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use((req, res, next) => {
	if (req.originalUrl.includes('stripe')) {
		next();
	} else {
		express.json({ limit: '150mb' })(req, res, next);
	}
});

// parse urlencoded request body
app.use(express.urlencoded({ limit: '150mb', extended: true }));

app.use((req, res, next) => {
	if (req.headers['content-type']?.includes('multipart/form-data')) {
		return next(); // skip xss-clean for uploads
	}
	next();
});

// sanitize request data
// app.use(xss());

app.use((req, res, next) => {
	if (req.headers['content-type']?.includes('multipart/form-data')) {
		return next();
	}
	xss()(req, res, next);
});

// gzip compression
app.use(compression());

// // enable cors
// app.use(cors());
// app.options('*', cors());

const allowedOrigins = [
	'http://localhost:4100', // local_cms
	'http://localhost:3001', // local_website
	'http://localhost:3000', // local_website
	'http://72.61.149.213:3000', // website
	'https://babiesnbaba.com', // website
	'http://babiesnbaba.com:3000', // website
	'http://72.61.149.213:5000', // cms
	'https://cms.babiesnbaba.com', // cms
	// add any other frontend URLs here
];

app.use(
	cors({
		origin: function (origin, callback) {
			// allow requests with no origin (like Postman or curl)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			} else {
				return callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	})
);
app.use(cookieParser());

// connect to postgres database
app.use((req, _, next) => {
	req.postgres = postgres;
	next();
});

// jwt authentication
app.use(jwt());

app.use(setUserMiddleware); // Fetches user from DB & sets full `req.user`

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	app.use('/v1/auth', authLimiter);
}
// Apply the formatter middleware
app.use(responseFormatter);

// Example route
app.get('/', async (req, res) => {
	try {
		// Some logic here
		res.send('server running111');
	} catch (err) {
		res.send(err, 'Failed to fetch user');
	}
});

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// execute cron jobs
executeCronJobs();

module.exports = app;
