const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// FOR CLIENTS
router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);


// FOR ADMIN
router.post('/admin-login', AuthController.adminLogin);

module.exports = router;
