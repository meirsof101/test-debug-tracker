// server/tests/integration/userRoutes.test.js
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('User Routes Integration', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
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
      await User.create([
        { name: 'John Doe', email: 'john@example.com', password: 'hashedpass1' },
        { name: 'Jane Smith', email: 'jane@example.com', password: 'hashedpass2' }
      ]);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].name).toBe('Jane Smith');
      expect(response.body[0].password).toBeUndefined();
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.password).toBeUndefined();

      const userInDb = await User.findById(response.body._id);
      expect(userInDb).toBeTruthy();
    });

    test('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toBeDefined();
    });

    test('should return error for duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedpass'
      });

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'New User',
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(400);

      expect(response.body.message).toContain('duplicate');
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user by id', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpass'
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.password).toBeUndefined();
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });
});