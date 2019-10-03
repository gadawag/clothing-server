const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const multerMiddleware = require('../middlewares/multerMiddleware');
const CategoryController = require('../controllers/CategoryController');

// For admin
router.get('/admin/category', isAdmin, CategoryController.getAdminCategory);
router.post('/category/create', isAdmin, multerMiddleware.multerCategory, CategoryController.createCategory);
router.patch('/category/update', isAdmin, multerMiddleware.multerCategory, CategoryController.updateCategory);

// For user
router.get('/category', CategoryController.getCategories);

module.exports = router;
