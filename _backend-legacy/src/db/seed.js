// src/db/seed.js — Dev seed data
// Run: npm run seed  (will DROP and re-seed)
'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('./pool');
const logger = require('../utils/logger');

async function seed() {
  const client = await pool.connect();
  try {
    logger.info('Seeding database…');

    const hash = await bcrypt.hash('password123', 12);

    // Admin user
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, account_status, email_verified)
      VALUES ('Admin AfriGig','admin@afrigig.com',$1,'admin','active',TRUE)
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    // Support user
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, account_status, email_verified)
      VALUES ('Support Agent','support@afrigig.com',$1,'support','active',TRUE)
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    // Approved freelancer
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, account_status, email_verified, country)
      VALUES ('Jane Wanjiku','jane@freelancer.com',$1,'freelancer','active',TRUE,'Kenya')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    const { rows: [jane] } = await client.query(
      `SELECT id FROM users WHERE email = 'jane@freelancer.com'`
    );
    if (jane) {
      await client.query(`
        INSERT INTO freelancer_profiles
          (user_id, freelancer_status, track, skills, experience, availability,
           bio, assessment_score, assessment_max, assessment_pct, assessment_unlocked,
           assessment_fee_paid, is_online)
        VALUES ($1,'APPROVED','software',
          ARRAY['JavaScript','React','Node.js','PostgreSQL'],
          'Senior full-stack developer with 5 years experience building SaaS products.',
          'Full-time',
          'Passionate developer from Nairobi. I love solving complex problems and building scalable systems.',
          78, 100, 78, TRUE, TRUE, TRUE)
        ON CONFLICT (user_id) DO UPDATE SET
          freelancer_status = EXCLUDED.freelancer_status,
          track = EXCLUDED.track
      `, [jane.id]);
      await client.query(
        `INSERT INTO wallets (user_id, balance) VALUES ($1, 5500.00) ON CONFLICT (user_id) DO NOTHING`,
        [jane.id]
      );
    }

    // Under-review freelancer
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, account_status, email_verified, country)
      VALUES ('Brian Ochieng','brian@test.com',$1,'freelancer','active',TRUE,'Kenya')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    const { rows: [brian] } = await client.query(
      `SELECT id FROM users WHERE email = 'brian@test.com'`
    );
    if (brian) {
      await client.query(`
        INSERT INTO freelancer_profiles
          (user_id, freelancer_status, track, skills, experience, availability,
           assessment_score, assessment_max, assessment_pct, assessment_unlocked,
           assessment_fee_paid, assessment_submitted_at, queue_position)
        VALUES ($1,'UNDER_REVIEW','data',
          ARRAY['Python','SQL','Tableau','Machine Learning'],
          '3 years as a data analyst at a fintech startup.',
          'Full-time', 85, 100, 85, TRUE, TRUE, NOW() - INTERVAL '2 days', 1)
        ON CONFLICT (user_id) DO UPDATE SET
          freelancer_status = EXCLUDED.freelancer_status
      `, [brian.id]);
    }

    // Platform config
    await client.query(`
      INSERT INTO platform_config (key, value) VALUES
        ('commission', '{"rate": 15}'::jsonb),
        ('assessment_fee', '{"min": 500, "max": 2000, "default": 1000}'::jsonb),
        ('review_sla_days', '{"value": 3}'::jsonb)
      ON CONFLICT (key) DO NOTHING
    `);

    // Sample job
    const { rows: [admin] } = await client.query(
      `SELECT id FROM users WHERE email = 'admin@afrigig.com'`
    );
    if (admin) {
      await client.query(`
        INSERT INTO jobs (created_by, title, description, category, skills_required,
                         budget_min, budget_max, duration_days, status)
        VALUES ($1,
          'Build a React Dashboard for Kenyan Fintech',
          'We need an experienced React developer to build a modern analytics dashboard for our mobile money product. The dashboard must handle real-time data updates, charts, and a clean mobile-responsive UI.',
          'Web Development',
          ARRAY['React','TypeScript','Chart.js','REST APIs'],
          80000, 150000, 30, 'open')
        ON CONFLICT DO NOTHING
      `, [admin.id]);
    }

    logger.info('✅ Seed complete');
    logger.info('   Logins: admin@afrigig.com / support@afrigig.com / jane@freelancer.com / brian@test.com');
    logger.info('   Password: password123');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  logger.error('Seed failed', { error: err.message });
  process.exit(1);
});
