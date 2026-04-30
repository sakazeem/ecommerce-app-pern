const express = require('express');
const { logSingle, syncBatch } = require('../../../controllers/Api/activityLogController');

const activityRouter = express.Router();

activityRouter.post('/log', logSingle);

activityRouter.post('/sync', syncBatch);

module.exports = activityRouter;
