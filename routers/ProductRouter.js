const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const multerMiddleware = require('../middlewares/multerMiddleware');
const ProductController = require('../controllers/ProductController');

// For admin
router.get('/admin/product', isAdmin, ProductController.getAdminProduct);
router.post('/product/create', isAdmin, multerMiddleware.multerProduct, ProductController.saveProduct);
router.patch('/product/update', isAdmin, multerMiddleware.multerProduct, ProductController.updateProduct);

// For user
router.get('/category-product/:slug', ProductController.getProductByCategory);

module.exports = router;
