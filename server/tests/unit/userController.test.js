// server/tests/unit/userController.test.js
const { getAllUsers, createUser, getUserById, updateUser, deleteUser } = require('../../src/controllers/userControllers');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

jest.mock('../../src/models/User');
jest.mock('bcryptjs');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers)
      });

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle database error', async () => {
      const errorMessage = 'Database error';
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching users',
        error: errorMessage
      });
    });
  });

  describe('getUserById', () => {
    test('should return user by ID successfully', async () => {
      const mockUser = { _id: '1', name: 'John Doe', email: 'john@example.com' };
      req.params.id = '1';

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('should return 404 if user not found', async () => {
      req.params.id = '999';

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      req.body = userData;

      const mockSavedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        toJSON: jest.fn().mockReturnValue({
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword123'
        })
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);

      await createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      req.body = userData;

      User.findOne.mockResolvedValue({ email: userData.email });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const userData = { name: 'John Updated', email: 'john.updated@example.com' };
      req.body = userData;
      req.params.id = '1';

      const mockUpdatedUser = { _id: '1', ...userData };

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      await updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        userData,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test('should return 404 if user not found during update', async () => {
      req.body = { name: 'John Updated' };
      req.params.id = '999';

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      req.params.id = '1';
      const mockDeletedUser = { _id: '1', name: 'John Doe' };

      User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);

      await deleteUser(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    test('should return 404 if user not found during deletion', async () => {
      req.params.id = '999';

      User.findByIdAndDelete.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
});