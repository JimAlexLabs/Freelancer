// src/services/email.service.js
// Sends transactional emails via SMTP (Mailtrap in dev, Resend/SES in prod)
// Logs every send attempt to the email_log table.

const nodemailer = require('nodemailer');
const { query }  = require('../db/pool');
const logger     = require('../utils/logger');

// ── Transport ────────────────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    secure: process.env.SMTP_PORT === '465',
  });
}

const FROM = `"${process.env.EMAIL_FROM_NAME || 'AfriGig'}" <${process.env.EMAIL_FROM || 'noreply@afrigig.com'}>`;
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── HTML Template wrapper ────────────────────────────────────
function wrap(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 0}
    .card{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}
    .header{background:linear-gradient(135deg,#00D4A0,#00A880);padding:32px;text-align:center}
    .header h1{color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em}
    .body{padding:32px}
    .body p{color:#374151;line-height:1.7;margin:0 0 16px}
    .btn{display:inline-block;background:#00D4A0;color:#fff!important;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin:8px 0}
    .footer{background:#F8FAFC;padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;font-size:12px;color:#9CA3AF}
    .code{font-family:monospace;background:#F3F4F6;padding:8px 16px;border-radius:6px;font-size:18px;font-weight:700;letter-spacing:.1em;color:#111}
  </style></head>
  <body><div class="card">
    <div class="header"><h1>AfriGig</h1></div>
    <div class="body"><h2 style="margin:0 0 20px;color:#111;font-size:20px">${title}</h2>${body}</div>
    <div class="footer">AfriGig Platform · <a href="${FRONTEND}" style="color:#00A880">afrigig.com</a> · This is an automated email, please do not reply.</div>
  </div></body></html>`;
}

// ── Email Templates ──────────────────────────────────────────
const templates = {

  verifyEmail: (name, token) => ({
    subject: 'Verify your AfriGig email address',
    html: wrap('Verify Your Email', `
      <p>Hi ${name},</p>
      <p>Thanks for joining AfriGig! Please verify your email address to activate your account.</p>
      <p><a class="btn" href="${FRONTEND}/verify-email?token=${token}">Verify Email Address</a></p>
      <p style="font-size:13px;color:#9CA3AF">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `),
  }),

  welcomeApproved: (name) => ({
    subject: '🎉 You\'re approved on AfriGig!',
    html: wrap('You\'re Approved!', `
      <p>Hi ${name},</p>
      <p>Congratulations! Your AfriGig application has been reviewed and <strong>approved</strong>.</p>
      <p>You can now browse jobs, submit proposals, and start earning.</p>
      <p><a class="btn" href="${FRONTEND}/freelancer/jobs">Browse Open Jobs</a></p>
      <p>Welcome to the AfriGig community!</p>
    `),
  }),

  resetPassword: (name, token) => ({
    subject: 'Reset your AfriGig password',
    html: wrap('Password Reset Request', `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new one.</p>
      <p><a class="btn" href="${FRONTEND}/reset-password?token=${token}">Reset My Password</a></p>
      <p style="font-size:13px;color:#9CA3AF">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
    `),
  }),

  assessmentUnlocked: (name) => ({
    subject: '🚀 Your AfriGig assessment is unlocked',
    html: wrap('Assessment Unlocked', `
      <p>Hi ${name},</p>
      <p>Your payment has been confirmed! Your skills assessment is now ready.</p>
      <p><strong>Important:</strong> Once you start, you have 2 hours to complete all sections. The timer cannot be paused.</p>
      <p><a class="btn" href="${FRONTEND}/onboarding">Start Assessment</a></p>
      <p>Good luck! 💪</p>
    `),
  }),

  assessmentResult: (name, pct, reviewDeadline) => ({
    subject: `Assessment submitted — ${pct}% score`,
    html: wrap('Assessment Submitted', `
      <p>Hi ${name},</p>
      <p>Your assessment has been received. Here's a summary:</p>
      <p style="text-align:center"><span class="code">${pct}%</span></p>
      <p>Our team will complete the review by <strong>${reviewDeadline}</strong>. You'll receive an email the moment a decision is made.</p>
    `),
  }),

  applicationReceived: (clientName, freelancerName, jobTitle) => ({
    subject: `New proposal on "${jobTitle}"`,
    html: wrap('New Proposal Received', `
      <p>Hi ${clientName},</p>
      <p><strong>${freelancerName}</strong> has submitted a proposal for your job: <em>${jobTitle}</em>.</p>
      <p><a class="btn" href="${FRONTEND}/admin/jobs">Review Proposals</a></p>
    `),
  }),

  ticketReply: (name, ticketSubject) => ({
    subject: `Support replied to: "${ticketSubject}"`,
    html: wrap('Support Response', `
      <p>Hi ${name},</p>
      <p>Our support team has replied to your ticket: <em>${ticketSubject}</em>.</p>
      <p><a class="btn" href="${FRONTEND}/tickets">View Reply</a></p>
    `),
  }),

  paymentReleased: (name, amount) => ({
    subject: `💰 ${amount} released to your wallet`,
    html: wrap('Payment Released!', `
      <p>Hi ${name},</p>
      <p>Great news! <strong>${amount}</strong> has been released to your AfriGig wallet.</p>
      <p><a class="btn" href="${FRONTEND}/freelancer/earnings">View Wallet</a></p>
    `),
  }),
};

// ── Send function ────────────────────────────────────────────
async function send(toEmail, templateName, templateData) {
  const template = templates[templateName];
  if (!template) {
    logger.error(`Unknown email template: ${templateName}`);
    return;
  }

  const { subject, html } = template(...templateData);

  try {
    const transport = createTransport();
    await transport.sendMail({ from: FROM, to: toEmail, subject, html });

    await query(
      `INSERT INTO email_log (to_email, subject, template, status)
       VALUES ($1, $2, $3, 'sent')`,
      [toEmail, subject, templateName]
    );

    logger.info(`Email sent: ${templateName} → ${toEmail}`);
  } catch (err) {
    logger.error('Email send failed', { to: toEmail, template: templateName, error: err.message });

    // Log failure — don't throw, email is non-critical path
    await query(
      `INSERT INTO email_log (to_email, subject, template, status, error)
       VALUES ($1, $2, $3, 'failed', $4)`,
      [toEmail, subject, templateName, err.message]
    ).catch(() => {}); // swallow secondary failure
  }
}

module.exports = { send, templates };
