const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRequest');

// POST /api/users/register - Register a new user
router.post('/register', validateRegistration, userController.registerUser);

// GET /api/users - List all registered users
router.get('/', userController.getUsers);

module.exports = router;
