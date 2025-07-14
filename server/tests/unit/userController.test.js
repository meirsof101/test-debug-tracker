const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

// Mock the User model
jest.mock('../../src/models/User');
jest.mock('bcryptjs');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request and response objects
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      // Mock the User.find() method
      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      await userController.getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle database error', async () => {
      const errorMessage = 'Database connection failed';
      
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: errorMessage
      });
    });
  });

  describe('getUserById', () => {
    test('should return user by ID successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      req.params = { id: '1' };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await userController.getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('should return 404 if user not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword123';
      const savedUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      
      req.body = userData;
      
      User.findOne.mockResolvedValue(null); // No existing user
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      const mockSave = jest.fn().mockResolvedValue({
        ...savedUser,
        password: hashedPassword,
        toObject: () => ({ ...savedUser, password: hashedPassword })
      });
      
      User.mockImplementation(() => ({
        save: mockSave,
        toObject: () => ({ ...savedUser, password: hashedPassword })
      }));

      await userController.createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedUser);
    });

    test('should return 400 if user already exists', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      req.body = userData;
      
      User.findOne.mockResolvedValue({ _id: '1', ...userData }); // Existing user

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const userData = { name: 'John Updated', email: 'john.updated@example.com' };
      const updatedUser = { _id: '1', ...userData };
      
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = userData;
      
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      await userController.updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        userData,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    test('should return 404 if user not found during update', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { name: 'John Updated' };
      
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      const deletedUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };

      req.params = { id: '507f1f77bcf86cd799439011' };
      User.findByIdAndDelete.mockResolvedValue(deletedUser);

      await userController.deleteUser(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    test('should return 404 if user not found during deletion', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      User.findByIdAndDelete.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});