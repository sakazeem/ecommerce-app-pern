// config/redis.js
const redis = require('redis');
const logger = require('./logger');

// const redisClient = redis.createClient();
// const redisClient = redis.createClient({
// 	url: process.env.REDIS_URL || 'redis://localhost:6379', // default URL for Redis
// });
const redisClient = redis.createClient({
	url: 'redis://127.0.0.1:6379',
});

redisClient.connect().catch((err) => {
	console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
	logger.info('Connected to Redis');
});

module.exports = redisClient;
