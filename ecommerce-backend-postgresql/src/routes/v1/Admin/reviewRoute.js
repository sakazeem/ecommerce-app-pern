const express = require('express');
const { updateReview } = require('../../../controllers/Admin/reviewController');

const router = express.Router();

router.route('/:reviewId').patch(updateReview);

module.exports = router;
