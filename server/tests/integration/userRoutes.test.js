const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../index');
const User = require('../../models/User');

describe('User Routes Integration', () => {
  let mongoServer;
  let mongoUri;

  beforeAll(async () => {
    try {
      // Create MongoDB Memory Server with optimized configuration
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '5.0.19',
          skipMD5: true,
        },
        instance: {
          dbName: 'test_db',
        },
        replSet: {
          count: 1,
          storageEngine: 'wiredTiger',
        },
      });

      mongoUri = mongoServer.getUri();
      
      // Connect to the in-memory database
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Failed to set up test database:', error);
      throw error;
    }
  }, 300000); // 5 minutes timeout for setup

  afterAll(async () => {
    try {
      // Clean up database connection
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      
      // Stop the MongoDB Memory Server
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Failed to clean up test database:', error);
    }
  }, 30000); // 30 seconds timeout for cleanup

  beforeEach(async () => {
    // Clear all data before each test
    await User.deleteMany({});
  });

  afterEach(async () => {
    // Clear all data after each test
    await User.deleteMany({});
  });

  describe('GET /api/users', () => {
    test('should return empty array when no users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all users', async () => {
      // Create test users
      const user1 = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword1'
      });
      const user2 = new User({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hashedPassword2'
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
    test('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.password).not.toBe(userData.password); // Should be hashed
      expect(response.body._id).toBeDefined();
    });

    test('should return validation error for invalid data', async () => {
      const invalidUserData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
        password: '123' // Too short password
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should return error for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user by id', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      });
      await user.save();

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body._id).toBe(user._id.toString());
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user successfully', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      });
      await user.save();

      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.email).toBe('john.updated@example.com');
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/users/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user successfully', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword'
      });
      await user.save();

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');
      expect(response.body.user.name).toBe('John Doe');

      // Verify user is deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});