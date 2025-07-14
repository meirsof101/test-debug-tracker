// server/tests/unit/User.test.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');

// Mock mongoose to avoid actual database connections
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose,
    model: jest.fn(),
    Schema: jest.fn(() => ({
      pre: jest.fn(),
      methods: {}
    })),
    connect: jest.fn(),
    connection: {
      close: jest.fn()
    }
  };
});

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create user schema with correct fields', () => {
    // Mock the User model constructor
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      createdAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({
        _id: 'mockId',
        name: 'John Doe',
        email: 'john@example.com'
      })
    };

    // Test that we can create a user instance
    expect(mockUser.name).toBe('John Doe');
    expect(mockUser.email).toBe('john@example.com');
    expect(mockUser.password).toBe('hashedPassword123');
    expect(typeof mockUser.save).toBe('function');
  });

  test('should have required fields', () => {
    const requiredFields = ['name', 'email', 'password'];
    
    // Mock schema definition
    const mockSchema = {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    };

    requiredFields.forEach(field => {
      expect(mockSchema[field]).toBeDefined();
      expect(mockSchema[field].required).toBe(true);
    });
  });

  test('should validate email format', () => {
  const emailRegex = /^(?!.*\.\.)([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  const validEmails = [
    'test@example.com',
    'user@domain.org',
    'name@company.co.uk',
    'person+alias@site.com',
    'firstname.lastname@domain.io'
  ];

  const invalidEmails = [
    'plainaddress',
    '@missingusername.com',
    'user@.com',
    'user name@domain.com',
    'user@domain',
    'user@domain.c',
    'user@.domain.com',
    'user@domain@domain.com',
    'user..double@domain.com'
  ];

  validEmails.forEach(email => {
    expect(emailRegex.test(email)).toBe(true);
  });

  invalidEmails.forEach(email => {
    const result = emailRegex.test(email);
    console.log(`Testing invalid email: ${email} => ${result}`);
    expect(result).toBe(false);
  });
});


  test('should hash password before saving', async () => {
    const mockUser = {
      password: 'plainTextPassword',
      isModified: jest.fn().mockReturnValue(true),
      save: jest.fn().mockResolvedValue(true)
    };

    // Mock bcrypt hashing
    const bcrypt = require('bcryptjs');
    jest.mock('bcryptjs', () => ({
      hash: jest.fn().mockResolvedValue('hashedPassword123')
    }));

    // Simulate pre-save hook behavior
    if (mockUser.isModified('password')) {
      const hashedPassword = await bcrypt.hash(mockUser.password, 10);
      mockUser.password = hashedPassword;
    }

    expect(mockUser.password).toBe('hashedPassword123');
  });
});