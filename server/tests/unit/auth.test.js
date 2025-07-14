// server/tests/unit/auth.test.js
const { authenticateToken, generateToken } = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();

    // Mock environment variable
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateToken', () => {
    test('should authenticate valid token', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      req.headers.authorization = 'Bearer valid-token';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET, expect.any(Function));
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should reject request without token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    test('should generate token with user data', () => {
      const mockUser = { _id: '1', email: 'test@example.com' };
      const mockToken = 'generated-token';

      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1', email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(token).toBe(mockToken);
    });
  });
});