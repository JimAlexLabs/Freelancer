// tests/health.test.js
'use strict';

const request = require('supertest');
const app     = require('../src/server');
const { pool } = require('../src/db/pool');

afterAll(() => pool.end());

describe('GET /health', () => {
  it('returns 200 with db status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
  });
});

describe('GET /api/v1', () => {
  it('returns API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('AfriGig API');
  });
});

describe('Unknown routes', () => {
  it('returns 404 for unknown path', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
  });
});
