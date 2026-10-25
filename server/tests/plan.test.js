'use strict';
/**
 * plan.test.js — Integration tests for Itinerary Generation & Saved Plans.
 *
 * Tests the core TSP / route planning algorithm, scheduling rules,
 * warnings, and saved plan persistence.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Place = require('../src/models/Place');
const Category = require('../src/models/Category');
const VisitPlan = require('../src/models/VisitPlan');
const User = require('../src/models/User');

let mongod;
let touristUser;
let touristToken;
let place1, place2, place3;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  touristUser = new User({ username: 'planneruser', role: 'tourist' });
  await touristUser.setPassword('PlannerPass123');
  await touristUser.save();
  touristToken = jwt.sign(
    { sub: touristUser._id.toString(), role: 'tourist' },
    process.env.JWT_SECRET || 'testsecret'
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Place.deleteMany({});
  await Category.deleteMany({});
  await VisitPlan.deleteMany({});

  const cat = await Category.create({ name: 'Culture', slug: 'culture' });

  // Place 1: Mulkirigala Rock Temple (~11km northeast)
  place1 = await Place.create({
    name: 'Mulkirigala Temple',
    categories: [cat._id],
    description: 'Rock monastery',
    visitDurationMinutes: 60,
    location: { type: 'Point', coordinates: [80.767, 6.166] },
    distanceKm: 11,
  });

  // Place 2: Tangalle Beach (~20km south)
  place2 = await Place.create({
    name: 'Tangalle Beach',
    categories: [cat._id],
    description: 'Golden sandy beach',
    visitDurationMinutes: 90,
    location: { type: 'Point', coordinates: [80.795, 6.024] },
    distanceKm: 20,
  });

  // Place 3: Hummanaya Blowhole (~24km south)
  place3 = await Place.create({
    name: 'Hummanaya Blowhole',
    categories: [cat._id],
    description: 'Natural sea blowhole',
    visitDurationMinutes: 45,
    location: { type: 'Point', coordinates: [80.706, 5.962] },
    distanceKm: 24,
  });
});

/* ─── Itinerary Preview Generation (Public) ───────────────────── */
describe('POST /api/plans/generate', () => {
  it('generates a timed itinerary for valid places starting at 08:00', async () => {
    const res = await request(app)
      .post('/api/plans/generate')
      .send({
        placeIds: [place1._id.toString(), place2._id.toString()],
        startTime: '08:00',
        orderMode: 'auto',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stops');
    expect(res.body.stops.length).toBe(2);

    const firstStop = res.body.stops[0];
    expect(firstStop).toHaveProperty('arrivalTime');
    expect(firstStop).toHaveProperty('departureTime');
    expect(firstStop.visitMinutes).toBe(60);
    expect(firstStop.travelMinutes).toBeGreaterThan(0);
    expect(Array.isArray(res.body.warnings)).toBe(true);
  });

  it('honors manual stop ordering when orderMode is manual', async () => {
    const orderedIds = [place3._id.toString(), place1._id.toString(), place2._id.toString()];
    const res = await request(app)
      .post('/api/plans/generate')
      .send({
        placeIds: orderedIds,
        manualOrder: orderedIds,
        startTime: '09:00',
        orderMode: 'manual',
      });

    expect(res.status).toBe(200);
    expect(res.body.stops.length).toBe(3);
    expect(res.body.stops[0].place._id.toString()).toBe(place3._id.toString());
    expect(res.body.stops[1].place._id.toString()).toBe(place1._id.toString());
    expect(res.body.stops[2].place._id.toString()).toBe(place2._id.toString());
  });

  it('rejects empty placeIds array', async () => {
    const res = await request(app)
      .post('/api/plans/generate')
      .send({ placeIds: [], startTime: '08:00' });

    expect(res.status).toBe(400);
  });

  it('rejects more than 20 stops (MAX_STOPS enforcement)', async () => {
    const dummyIds = Array.from({ length: 21 }, () => new mongoose.Types.ObjectId().toString());
    const res = await request(app)
      .post('/api/plans/generate')
      .send({ placeIds: dummyIds, startTime: '08:00' });

    expect(res.status).toBe(400);
  });

  it('emits an itinerary warning if the schedule exceeds 18:00', async () => {
    // Starting late at 17:00 with 60 + 90 min stops will exceed 18:00
    const res = await request(app)
      .post('/api/plans/generate')
      .send({
        placeIds: [place1._id.toString(), place2._id.toString()],
        startTime: '17:00',
        orderMode: 'auto',
      });

    expect(res.status).toBe(200);
    expect(res.body.warnings.length).toBeGreaterThan(0);
    expect(res.body.warnings[0]).toMatch(/18:00/);
  });
});

/* ─── Saved Plans CRUD (Authenticated) ────────────────────────── */
describe('Saved Plans CRUD (/api/plans)', () => {
  it('allows a logged-in tourist to save a plan', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${touristToken}`)
      .send({
        title: 'Southern Explorer Day 1',
        placeIds: [place1._id.toString(), place2._id.toString()],
        startTime: '08:30',
        orderMode: 'auto',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Southern Explorer Day 1');
    expect(res.body.stops.length).toBe(2);
  });

  it('lists saved plans for the user', async () => {
    await VisitPlan.create({
      user: touristUser._id,
      title: 'Saved Plan A',
      stops: [{ place: place1._id, order: 0 }],
      startTime: '08:00',
      orderMode: 'auto',
    });

    const res = await request(app)
      .get('/api/plans')
      .set('Authorization', `Bearer ${touristToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Saved Plan A');
  });

  it('retrieves saved plan detail with dynamically computed itinerary stops', async () => {
    const plan = await VisitPlan.create({
      user: touristUser._id,
      title: 'Detailed Plan',
      stops: [
        { place: place1._id, order: 0 },
        { place: place2._id, order: 1 },
      ],
      startTime: '08:00',
      orderMode: 'auto',
    });

    const res = await request(app)
      .get(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${touristToken}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Detailed Plan');
    expect(res.body).toHaveProperty('computedStops');
    expect(res.body.computedStops.length).toBe(2);
  });

  it('deletes a saved plan', async () => {
    const plan = await VisitPlan.create({
      user: touristUser._id,
      title: 'Plan to delete',
      stops: [{ place: place1._id, order: 0 }],
      startTime: '08:00',
      orderMode: 'auto',
    });

    const delRes = await request(app)
      .delete(`/api/plans/${plan._id}`)
      .set('Authorization', `Bearer ${touristToken}`);

    expect(delRes.status).toBe(204);

    const check = await VisitPlan.findById(plan._id);
    expect(check).toBeNull();
  });
});
