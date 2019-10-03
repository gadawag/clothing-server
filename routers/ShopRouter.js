const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const ShopController = require('../controllers/ShopController');

// Save the whole cart from localStorage
router.post('/save-cart', isAuth, ShopController.saveCart);

// Save a product from user's cart
router.post('/add-to-cart', isAuth, ShopController.addToCart);

// Decrease / delete a product from user's Cart
router.post('/less-to-cart', isAuth, ShopController.lessToCart);

// Remove a product from user's Cart
router.post('/remove-to-cart', isAuth, ShopController.removeToCart);

// Get the cart from user's data
router.get('/get-cart', isAuth, ShopController.getCart);

// Charge user
router.post('/charge', isAuth, ShopController.chargeUser);

// Order history
router.get('/order-history', isAuth, ShopController.getOrderHistory);

module.exports = router;
