const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('mongoose');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com', age: 25 },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 30 }
      ];

      User.find.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle database error', async () => {
      const errorMessage = 'Database error';
      User.find.mockRejectedValue(new Error(errorMessage));

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });
  });

  describe('getUserById', () => {
    test('should return user by ID successfully', async () => {
      const mockUser = { _id: '507f1f77bcf86cd799439011', name: 'John Doe', email: 'john@example.com', age: 25 };
      req.params.id = '507f1f77bcf86cd799439011';

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(User.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid-id';
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    test('should return 404 if user not found', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findById.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should handle database error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      const errorMessage = 'Database error';
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findById.mockRejectedValue(new Error(errorMessage));

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      req.body = userData;

      const savedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      User.findOne.mockResolvedValue(null); // No existing user
      
      // Mock the User constructor and save method
      const mockUserInstance = {
        save: jest.fn().mockResolvedValue(savedUser)
      };
      User.mockImplementation(() => mockUserInstance);

      await userController.createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedUser);
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      req.body = userData;

      const existingUser = { _id: '1', email: 'john@example.com' };
      User.findOne.mockResolvedValue(existingUser);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User with this email already exists'
      });
    });

    test('should handle validation error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25
      };
      req.body = userData;

      User.findOne.mockResolvedValue(null);
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      const mockUserInstance = {
        save: jest.fn().mockRejectedValue(validationError)
      };
      User.mockImplementation(() => mockUserInstance);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed'
      });
    });

    test('should handle database error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };
      req.body = userData;

      const errorMessage = 'Database error';
      User.findOne.mockRejectedValue(new Error(errorMessage));

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const userData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 30
      };
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = userData;

      const updatedUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 30
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findOne.mockResolvedValue(null); // No existing user with same email
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        userData,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    test('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid-id';
      req.body = { name: 'John Updated' };

      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    test('should return 404 if user not found during update', async () => {
      const userData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 30
      };
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = userData;

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should handle database error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { name: 'John Updated' };

      const errorMessage = 'Database error';
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findOne.mockRejectedValue(new Error(errorMessage));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      req.params.id = '507f1f77bcf86cd799439011';

      const deletedUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findByIdAndDelete.mockResolvedValue(deletedUser);

      await userController.deleteUser(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
        user: deletedUser
      });
    });

    test('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid-id';
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    test('should return 404 if user not found during deletion', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findByIdAndDelete.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should handle database error', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      const errorMessage = 'Database error';
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      User.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });
  });
});