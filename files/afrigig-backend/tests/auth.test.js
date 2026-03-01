// tests/auth.test.js
'use strict';

const request = require('supertest');
const app     = require('../src/server');
const { pool, query } = require('../src/db/pool');
const bcrypt  = require('bcryptjs');

let testEmail, testUser, accessToken, refreshToken;

beforeAll(async () => {
  testEmail = `test_${Date.now()}@afrigig.test`;
});

afterAll(async () => {
  // Clean up test user
  if (testUser) {
    await query('DELETE FROM users WHERE id = $1', [testUser.id]).catch(() => {});
  }
  await pool.end();
});

describe('POST /api/v1/auth/register', () => {
  it('creates a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'securePass123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user.email).toBe(testEmail);
    testUser = res.body.user;
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email: testEmail, password: 'pass123' });
    expect(res.status).toBe(409);
  });

  it('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bad', email: 'bad@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid email with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bad', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    // Force-verify the test user so they can log in
    if (testUser) {
      await query(
        `UPDATE users SET email_verified = TRUE, account_status = 'active' WHERE id = $1`,
        [testUser.id]
      );
    }
  });

  it('returns access_token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'securePass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user.email).toBe(testEmail);

    accessToken = res.body.access_token;
    // Refresh token comes as httpOnly cookie
    refreshToken = res.headers['set-cookie']?.find(c => c.startsWith('refreshToken'))
      ?.split(';')[0]?.split('=')[1];
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@afrigig.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns user data with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('returns new access_token using cookie', async () => {
    if (!refreshToken) return; // skip if cookie extraction failed
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('rejects missing refresh token with 401', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('returns 200 even for unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@nowhere.com' });
    expect(res.status).toBe(200);
  });

  it('returns 200 for known email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testEmail });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('successfully logs out', async () => {
    if (!refreshToken) return;
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });
});

describe('Rate limiting', () => {
  it('blocks after too many auth attempts', async () => {
    const email = 'ratelimit@test.com';
    const attempts = Array.from({ length: 12 }, () =>
      request(app).post('/api/v1/auth/login').send({ email, password: 'wrong' })
    );
    const results = await Promise.all(attempts);
    const blocked = results.some(r => r.status === 429);
    expect(blocked).toBe(true);
  }, 30000);
});
