// server/tests/unit/userController.test.js
const { getAllUsers, createUser, getUserById } = require('../../src/controllers/userController');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

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
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ];

      User.find.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({}, '-password');
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle errors', async () => {
      User.find.mockRejectedValue(new Error('Database error'));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('createUser', () => {
    test('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      req.body = userData;

      const mockUser = { _id: '1', ...userData };
      User.prototype.save = jest.fn().mockResolvedValue(mockUser);

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        })
      );
    });

    test('should handle validation errors', async () => {
      req.body = { name: '' };

      User.prototype.save = jest.fn().mockRejectedValue({
        name: 'ValidationError',
        errors: {
          name: { message: 'Name is required' }
        }
      });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: { name: 'Name is required' }
      });
    });
  });
});