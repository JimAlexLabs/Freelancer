# AfriGig Backend v3.0

REST API built with **Node.js + Express + PostgreSQL**.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials, JWT secrets, SMTP settings
```

### 3. Generate secure JWT secrets
```bash
node -e "console.log('ACCESS:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH:', require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Create the database
```bash
# PostgreSQL
createdb afrigig
psql -c "CREATE USER afrigig_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE afrigig TO afrigig_user;"
```

### 5. Run migrations (creates all tables)
```bash
npm run migrate
```

### 6. Seed with demo data
```bash
npm run seed
```
Demo logins (password: `password123`):
| Email | Role |
|---|---|
| admin@afrigig.com | Admin |
| support@afrigig.com | Support |
| jane@freelancer.com | Approved Freelancer |
| brian@test.com | Under Review |

### 7. Start the server
```bash
npm run dev        # development (nodemon)
npm start          # production
```

API available at: `http://localhost:4000`
Health check: `http://localhost:4000/health`
API docs: `http://localhost:4000/api/v1`

---

## Key Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register (sends verification email) |
| POST | /api/v1/auth/login | Login → access_token + refresh cookie |
| POST | /api/v1/auth/refresh | Rotate refresh token |
| POST | /api/v1/auth/logout | Revoke session |
| POST | /api/v1/auth/logout-all | Revoke ALL sessions |
| GET  | /api/v1/auth/verify-email?token=X | Verify email |
| POST | /api/v1/auth/forgot-password | Send reset email |
| POST | /api/v1/auth/reset-password | Use reset token |
| POST | /api/v1/auth/change-password | Change password (auth required) |
| GET  | /api/v1/auth/me | Get own user + profile |

### Freelancers
| Method | Path | Description |
|---|---|---|
| PATCH | /api/v1/users/profile | Update profile |
| PATCH | /api/v1/users/profile/track | Set track |
| GET   | /api/v1/users/profile/:id | Public profile |

### Jobs
| Method | Path | Description |
|---|---|---|
| GET  | /api/v1/jobs | List (filters: category, skills, budget, q) |
| GET  | /api/v1/jobs/:id | Get one |
| POST | /api/v1/jobs | Create (admin) |
| POST | /api/v1/jobs/:id/applications | Apply |
| GET  | /api/v1/applications | Own applications |

### Admin
| Method | Path | Description |
|---|---|---|
| GET   | /api/v1/admin/stats | Platform stats |
| GET   | /api/v1/admin/users | All users (filters: role, fs, track) |
| PATCH | /api/v1/admin/users/:id/status | approve/reject/suspend/ban |
| GET   | /api/v1/admin/reviews | FIFO review queue |
| GET   | /api/v1/admin/audit-log | Audit trail |
| GET   | /api/v1/admin/email-log | Email send history |

---

## Security Model

- **Access tokens**: signed JWT, 15min TTL, HS256
- **Refresh tokens**: random 48-byte opaque token, stored SHA-256 hashed in DB, 30-day TTL
- **Refresh token rotation**: each use invalidates the old token and issues a new one
- **Token reuse detection**: if a revoked refresh token is used, ALL user sessions are immediately revoked
- **Passwords**: bcrypt, 12 rounds
- **Email verification**: required before any protected action
- **Rate limiting**: 100 req/15min globally; 10/15min on auth routes; 3/hr on password reset
- **CORS**: allowlist-based, credentials mode

---

## Architecture

```
src/
├── server.js              # Express app entry, middleware, error handling
├── controllers/
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── jobs.controller.js
│   ├── applications.controller.js
│   ├── messages.controller.js
│   ├── tickets.controller.js
│   ├── payments.controller.js
│   ├── notifications.controller.js
│   └── admin.controller.js
├── routes/
│   ├── index.js           # Master router
│   ├── auth.routes.js
│   ├── users.routes.js
│   ├── jobs.routes.js
│   ├── applications.routes.js
│   ├── messages.routes.js
│   ├── tickets.routes.js
│   ├── payments.routes.js
│   ├── notifications.routes.js
│   └── admin.routes.js
├── middleware/
│   ├── auth.middleware.js      # requireAuth, requireRole, requireEmailVerified
│   ├── rateLimit.middleware.js # tiered rate limits
│   └── validate.middleware.js  # express-validator error handling
├── db/
│   ├── pool.js            # pg Pool singleton + query/transaction helpers
│   ├── migrate.js         # Idempotent schema migrations
│   └── seed.js            # Dev seed data
├── services/
│   └── email.service.js   # Nodemailer + HTML templates + email_log
└── utils/
    ├── jwt.js             # Token signing/verification/generation
    └── logger.js          # Winston structured logging

api.js  ← Copy to frontend — drop-in replacement for window.storage calls
tests/
├── health.test.js
└── auth.test.js
```

## Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set real `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (different 64-byte hex strings)
- [ ] Set `DB_SSL=true`
- [ ] Configure real SMTP (Resend recommended for Africa deliverability)
- [ ] Set `ALLOWED_ORIGINS` to your production domain
- [ ] Run behind nginx (handles TLS, compression)
- [ ] Set up log rotation
- [ ] Consider Redis for rate limit store (distributed deployments)
