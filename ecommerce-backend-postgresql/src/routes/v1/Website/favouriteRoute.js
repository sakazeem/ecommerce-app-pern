const express = require('express');
const { favouriteController } = require('../../../controllers/Api');
const router = express.Router();

router.get('/', favouriteController.getFavourites);
router.post('/toggle', favouriteController.toggleFavourite);
router.post('/sync', favouriteController.syncFavourites);
router.post('/verify', favouriteController.verifyFavourites);

module.exports = router;