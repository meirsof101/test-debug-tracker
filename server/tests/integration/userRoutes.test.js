const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

// Set Jest timeout for this entire test suite to 2 minutes
jest.setTimeout(120000);

describe('User Routes Integration', () => {
  let mongoServer;

  beforeAll(async () => {
    try {
      // Create MongoDB Memory Server with explicit configuration
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '5.0.19',
          skipMD5: true
        },
        instance: {
          port: 0, // Use random available port
          dbName: 'testdb'
        }
      });
      
      const mongoUri = mongoServer.getUri();
      console.log('MongoDB URI:', mongoUri);
      
      // Connect to the in-memory database
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log('Connected to test database');
    } catch (error) {
      console.error('MongoDB setup failed:', error);
      throw error;
    }
  }, 120000); // 2 minute timeout for setup

  afterAll(async () => {
    try {
      // Close mongoose connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.error('Error closing mongoose connection:', error);
    }
    
    try {
      // Stop MongoDB Memory Server
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Error stopping MongoDB server:', error);
    }
  }, 30000);

  beforeEach(async () => {
    // Clear all collections before each test
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  describe('GET /api/users', () => {
    it('should return empty array when no users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all users', async () => {
      // Create test users
      const user1 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });
      const user2 = new User({
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25
      });

      await user1.save();
      await user2.save();

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].name).toBe('Jane Smith');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 28
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.age).toBe(userData.age);
      expect(response.body._id).toBeDefined();

      // Verify user was saved to database
      const savedUser = await User.findById(response.body._id);
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });

    it('should return validation error for invalid data', async () => {
      const invalidUserData = {
        name: '', // Empty name should fail validation
        email: 'invalid-email', // Invalid email format
        age: -5 // Negative age should fail validation
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'First User',
        email: 'duplicate@example.com',
        age: 30
      };

      // Create first user
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUserData = {
        name: 'Second User',
        email: 'duplicate@example.com',
        age: 25
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.error).toContain('email');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        age: 30
      });
      await user.save();

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.name).toBe(user.name);
      expect(response.body.email).toBe(user.email);
      expect(response.body.age).toBe(user.age);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});