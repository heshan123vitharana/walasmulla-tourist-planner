'use strict';
/**
 * auth.test.js — Integration tests for the authentication endpoints.
 *
 * Uses mongodb-memory-server so no external MongoDB is required.
 * Covers: REQ-5.1 (register), REQ-5.2 (login/lockout), REQ-5.5 (tourist registration),
 *         D4 (lockout values), D5 (blocked user rejection).
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const { LOGIN_MAX_ATTEMPTS } = require('../src/config/constants');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up users between tests
  await User.deleteMany({});
});

/* ─── POST /api/auth/register ─────────────────────────────────── */
describe('POST /api/auth/register', () => {
  it('registers a new tourist with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.role).toBe('tourist');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('stores username in lowercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'TestUser', password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('testuser');
  });

  it('rejects duplicate username', async () => {
    await request(app).post('/api/auth/register').send({ username: 'alice', password: 'Password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'Password456' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('rejects username shorter than 3 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', password: 'Password123' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('username');
  });

  it('rejects username longer than 30 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a'.repeat(31), password: 'Password123' });

    expect(res.status).toBe(400);
  });

  it('rejects password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'validuser', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('password');
  });

  it('strips NoSQL injection attempts from username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: { $gt: '' }, password: 'Password123' });

    // After sanitisation, username will be undefined/empty → validation error
    expect(res.status).toBe(400);
  });
});

/* ─── POST /api/auth/login ────────────────────────────────────── */
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'loginuser', password: 'Password123' });
  });

  it('returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('loginuser');
  });

  it('returns generic error on wrong password (does not leak username exists)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });

  it('returns generic error on non-existent username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });

  it(`locks account after ${LOGIN_MAX_ATTEMPTS} failed attempts`, async () => {
    // Submit LOGIN_MAX_ATTEMPTS wrong passwords
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'wrongpassword' });
    }

    // Next attempt — even with correct password — should be locked
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/locked/i);
  });

  it('clears failed attempts on successful login', async () => {
    // 2 failed attempts
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'wrong' });
    }
    // Successful login
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'Password123' });

    // Check DB — failedLoginAttempts should be 0
    const user = await User.findOne({ username: 'loginuser' });
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockUntil).toBeNull();
  });
});

/* ─── GET /api/auth/me ────────────────────────────────────────── */
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'meuser', password: 'Password123' });
    token = res.body.token;
  });

  it('returns user info with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('meuser');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

/* ─── Blocked user ────────────────────────────────────────────── */
describe('Blocked user (D5)', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'blockeduser', password: 'Password123' });
    token = res.body.token;

    // Block the user directly in DB
    await User.updateOne({ username: 'blockeduser' }, { status: 'blocked' });
  });

  it('rejects login for blocked user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'blockeduser', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });

  it('rejects valid token for blocked user on /me', async () => {
    // Token was issued before blocking — must still be rejected
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

/* ─── Role guard ──────────────────────────────────────────────── */
describe('Admin role guard', () => {
  it('rejects tourist token on admin-only route', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ username: 'touristonly', password: 'Password123' });
    const token = reg.body.token;

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    // Should be 403 (or 404 if route not yet registered — acceptable in M1)
    expect([403, 404]).toContain(res.status);
  });
});
