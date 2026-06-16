import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index';
import { User } from '../src/models/User';

jest.setTimeout(120000);

describe('Express API Route Endpoints', () => {
  beforeAll(async () => {
    let checks = 0;
    while (mongoose.connection.readyState !== 1 && checks < 240) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      checks++;
    }
  });

  afterAll(async () => {
    // Clean up connections
    await mongoose.connection.close();
  });

  test('GET /health - should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /api/auth/register - should create a new user profile', async () => {
    // Generate random email to avoid duplicate key errors
    const randomEmail = `testuser_${Math.floor(Math.random() * 100000)}@ecotrack.org`;
    
    const registerData = {
      name: 'Test eco-friend',
      email: randomEmail,
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(registerData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe(registerData.name);
    expect(res.body.user.email).toBe(registerData.email);

    // Verify it is saved in MongoDB memory server
    const savedUser = await User.findOne({ email: randomEmail });
    expect(savedUser).toBeDefined();
    expect(savedUser?.name).toBe(registerData.name);
  });

  test('POST /api/auth/login - should log in and return JWT token', async () => {
    const randomEmail = `loginuser_${Math.floor(Math.random() * 100000)}@ecotrack.org`;
    
    // Seed user directly
    const resReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test',
        email: randomEmail,
        password: 'securePassword123'
      });

    const resLog = await request(app)
      .post('/api/auth/login')
      .send({
        email: randomEmail,
        password: 'securePassword123'
      });

    expect(resLog.status).toBe(200);
    expect(resLog.body).toHaveProperty('token');
    expect(resLog.body.user.name).toBe('Login Test');
  });

  test('POST /api/auth/login - should accept trimmed and case-insensitive email input', async () => {
    const rawEmail = `  MixedCase_${Math.floor(Math.random() * 100000)}@EcoTrack.ORG  `;
    const password = 'StrongPass123';

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Normalization',
        email: rawEmail,
        password
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: rawEmail.toUpperCase(),
        password
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(rawEmail.trim().toLowerCase());
  });

  test('POST /api/auth/register - should normalize email and trim name', async () => {
    const rawEmail = `  Normalized_${Math.floor(Math.random() * 100000)}@EcoTrack.ORG  `;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '  Trimmed Name  ',
        email: rawEmail,
        password: 'securePass123'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Trimmed Name');
    expect(res.body.user.email).toBe(rawEmail.trim().toLowerCase());
  });

  test('POST /api/auth/register - should reject weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak Password User',
        email: `weak_${Math.floor(Math.random() * 100000)}@ecotrack.org`,
        password: 'short1'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Password must be at least 8 characters long');
  });

  test('POST /api/footprint - should reject unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/footprint')
      .send({});

    expect(res.status).toBe(401);
  });

  test('POST /api/footprint - should save valid footprint for authenticated user', async () => {
    const randomEmail = `footprintuser_${Math.floor(Math.random() * 100000)}@ecotrack.org`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Footprint User',
        email: randomEmail,
        password: 'securePassword123'
      });

    const token = registerRes.body.token;

    const payload = {
      transport: { carKm: 10, bikeKm: 0, transitKm: 5, flightsHours: 2, rideshareKm: 0 },
      energy: { electricityKwh: 180, acHours: 2, appliancesKwh: 45 },
      food: { dietType: 'mixed' },
      waste: { recycling: true, plasticUsage: 'medium' },
      water: { dailyLiters: 140 }
    };

    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('totalCo2');
    expect(res.body).toHaveProperty('score');
    expect(res.body.energy.appliancesKwh).toBe(45);
  });

  test('POST /api/footprint - should reject invalid payload values', async () => {
    const randomEmail = `invalidfp_${Math.floor(Math.random() * 100000)}@ecotrack.org`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Payload User',
        email: randomEmail,
        password: 'securePassword123'
      });

    const token = registerRes.body.token;

    const badPayload = {
      transport: { carKm: -1, bikeKm: 0, transitKm: 0, flightsHours: 0, rideshareKm: 0 },
      energy: { electricityKwh: 100, acHours: 2, appliancesKwh: 30 },
      food: { dietType: 'mixed' },
      waste: { recycling: true, plasticUsage: 'medium' },
      water: { dailyLiters: 140 }
    };

    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', `Bearer ${token}`)
      .send(badPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('transport.carKm');
  });
});
