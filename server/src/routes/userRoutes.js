const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// POST /api/users - Create a new user
router.post('/', userController.createUser);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user by ID
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;