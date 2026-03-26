const express = require('express');
const { cartController } = require('../../../controllers/Api');
const router = express.Router();

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.post('/sync', cartController.syncCart);
router.post('/verify', cartController.verifyCart);
router.patch('/:id', cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
