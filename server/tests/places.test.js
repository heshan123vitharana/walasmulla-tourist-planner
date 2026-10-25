'use strict';
/**
 * places.test.js — Integration tests for public and admin Places endpoints.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Place = require('../src/models/Place');
const Category = require('../src/models/Category');
const User = require('../src/models/User');

let mongod;
let adminToken;
let touristToken;
let testCategory;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Create admin user & tourist user
  const admin = new User({ username: 'superadmin', role: 'admin' });
  await admin.setPassword('AdminPass123');
  await admin.save();
  adminToken = jwt.sign({ sub: admin._id.toString(), role: 'admin' }, process.env.JWT_SECRET || 'testsecret');

  const tourist = new User({ username: 'regtourist', role: 'tourist' });
  await tourist.setPassword('TouristPass123');
  await tourist.save();
  touristToken = jwt.sign({ sub: tourist._id.toString(), role: 'tourist' }, process.env.JWT_SECRET || 'testsecret');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Place.deleteMany({});
  await Category.deleteMany({});

  testCategory = await Category.create({
    name: 'Cultural & Heritage',
    slug: 'cultural-heritage',
    description: 'Historical temples and cultural sites',
  });
});

/* ─── Public Places Listing & Filtering ──────────────────────── */
describe('GET /api/places', () => {
  it('returns active places with populated category details', async () => {
    await Place.create({
      name: 'Mulkirigala Rock Temple',
      categories: [testCategory._id],
      description: 'Ancient rock cave temple with murals',
      visitDurationMinutes: 90,
      location: { type: 'Point', coordinates: [80.767, 6.166] },
      isActive: true,
      distanceKm: 11,
    });

    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Mulkirigala Rock Temple');
    expect(res.body[0].categories[0].name).toBe('Cultural & Heritage');
    expect(res.body[0].slug).toBe('mulkirigala-rock-temple');
  });

  it('excludes inactive places from public listing', async () => {
    await Place.create({
      name: 'Hidden Inactive Cave',
      categories: [testCategory._id],
      description: 'Closed for excavation',
      visitDurationMinutes: 45,
      location: { type: 'Point', coordinates: [80.7, 6.15] },
      isActive: false,
    });

    const res = await request(app).get('/api/places');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('filters places by category slug', async () => {
    const natureCat = await Category.create({ name: 'Nature', slug: 'nature' });

    await Place.create({
      name: 'Heritage Place',
      categories: [testCategory._id],
      description: 'Temple description',
      visitDurationMinutes: 60,
      location: { type: 'Point', coordinates: [80.7, 6.15] },
    });

    await Place.create({
      name: 'Nature Reserve',
      categories: [natureCat._id],
      description: 'Forest reserve',
      visitDurationMinutes: 90,
      location: { type: 'Point', coordinates: [80.8, 6.2] },
    });

    const res = await request(app).get('/api/places?category=nature');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Nature Reserve');
  });
});

/* ─── GET /api/places/:slugOrId ────────────────────────────────── */
describe('GET /api/places/:slugOrId', () => {
  it('retrieves place by slug', async () => {
    const place = await Place.create({
      name: 'Hummanaya Blowhole',
      categories: [testCategory._id],
      description: 'Natural sea blowhole',
      visitDurationMinutes: 45,
      location: { type: 'Point', coordinates: [80.706, 5.962] },
    });

    const res = await request(app).get(`/api/places/${place.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Hummanaya Blowhole');
  });

  it('retrieves place by Mongo ObjectId', async () => {
    const place = await Place.create({
      name: 'Katuwana Fort',
      categories: [testCategory._id],
      description: '17th-century Dutch inland fort',
      visitDurationMinutes: 60,
      location: { type: 'Point', coordinates: [80.686, 6.244] },
    });

    const res = await request(app).get(`/api/places/${place._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Katuwana Fort');
  });

  it('returns 404 for non-existent slug or id', async () => {
    const res = await request(app).get('/api/places/unknown-destination-xyz');
    expect(res.status).toBe(404);
  });
});

/* ─── Admin Places CRUD ────────────────────────────────────────── */
describe('Admin Places CRUD (/api/admin/places)', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/admin/places').send({});
    expect(res.status).toBe(401);
  });

  it('rejects tourist requests with 403', async () => {
    const res = await request(app)
      .post('/api/admin/places')
      .set('Authorization', `Bearer ${touristToken}`)
      .send({ name: 'Unauthorized Place' });
    expect(res.status).toBe(403);
  });

  it('allows admin to create a new place with coordinates and auto-calculated distance', async () => {
    const payload = {
      name: 'Walasmulla Botanical Park',
      categories: [testCategory._id.toString()],
      description: 'Lush tropical herbal and spice garden',
      visitDurationMinutes: 60,
      location: {
        type: 'Point',
        coordinates: [80.705, 6.155], // [lng, lat] near Walasmulla
      },
      entryRequirements: 'Modest casual clothing',
      isActive: true,
    };

    const res = await request(app)
      .post('/api/admin/places')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Walasmulla Botanical Park');
    expect(res.body.slug).toBe('walasmulla-botanical-park');
    // distanceKm should be auto-estimated
    expect(typeof res.body.distanceKm).toBe('number');
  });

  it('rejects place creation when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/admin/places')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Place' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('allows admin to update an existing place', async () => {
    const place = await Place.create({
      name: 'Original Name',
      categories: [testCategory._id],
      description: 'Original description',
      visitDurationMinutes: 45,
      location: { type: 'Point', coordinates: [80.698, 6.152] },
    });

    const res = await request(app)
      .put(`/api/admin/places/${place._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name', visitDurationMinutes: 90 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.visitDurationMinutes).toBe(90);
    expect(res.body.slug).toBe('updated-name');
  });

  it('allows admin to delete a place', async () => {
    const place = await Place.create({
      name: 'Place to Delete',
      categories: [testCategory._id],
      description: 'Will be removed',
      visitDurationMinutes: 30,
      location: { type: 'Point', coordinates: [80.698, 6.152] },
    });

    const delRes = await request(app)
      .delete(`/api/admin/places/${place._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.status).toBe(204);

    // Verify deleted
    const check = await Place.findById(place._id);
    expect(check).toBeNull();
  });
});
