// src/controllers/payments.controller.js
'use strict';

const { query, transaction } = require('../db/pool');
const emailSvc = require('../services/email.service');
const logger   = require('../utils/logger');
const { v4: uuid } = require('uuid');

/** POST /payments/escrow/deposit  — admin deposits to escrow */
async function depositEscrow(req, res) {
  const { job_id, amount, method = 'mpesa', phone } = req.body;
  if (!job_id || !amount || amount <= 0) {
    return res.status(400).json({ error: 'job_id and positive amount required' });
  }
  try {
    const { rows: job } = await query('SELECT id, title FROM jobs WHERE id = $1', [job_id]);
    if (!job.length) return res.status(404).json({ error: 'Job not found' });

    // Simulate STK push (in production: call Daraja API)
    await new Promise(r => setTimeout(r, 300));

    const reference = `ESC-${uuid().slice(0, 8).toUpperCase()}`;

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO escrows (job_id, amount, status, reference) VALUES ($1,$2,'holding',$3)`,
        [job_id, amount, reference]
      );
      await client.query(
        `UPDATE jobs SET payment_status = 'escrow', escrow_amount = $1 WHERE id = $2`,
        [amount, job_id]
      );
      // Log transaction from admin wallet
      const { rows: w } = await client.query(
        'SELECT id FROM wallets WHERE user_id = $1', [req.user.id]
      );
      if (w.length) {
        await client.query(
          `INSERT INTO transactions (wallet_id, type, entry_type, amount, reference, meta)
           VALUES ($1,'escrow_hold','debit',$2,$3,$4)`,
          [w[0].id, amount, reference, JSON.stringify({ job_id, method, phone })]
        );
      }
      await client.query(
        `INSERT INTO audit_log (user_id, action, description) VALUES ($1,'escrow.deposit',$2)`,
        [req.user.id, `Deposited KES ${amount} for job "${job[0].title}" (${reference})`]
      );
    });

    return res.status(201).json({
      message:   'Escrow deposit successful',
      reference,
      amount,
      job_id,
    });
  } catch (err) {
    logger.error('depositEscrow error', { error: err.message });
    return res.status(500).json({ error: 'Failed to process escrow deposit' });
  }
}

/** POST /payments/escrow/:id/release  — admin releases escrow */
async function releaseEscrow(req, res) {
  const escrowId = req.params.id;
  try {
    const { rows: esc } = await query(
      `SELECT e.*, j.assigned_to, j.title AS job_title
       FROM escrows e JOIN jobs j ON j.id = e.job_id WHERE e.id = $1`,
      [escrowId]
    );
    if (!esc.length) return res.status(404).json({ error: 'Escrow not found' });
    if (esc[0].status !== 'holding') {
      return res.status(400).json({ error: `Escrow is already ${esc[0].status}` });
    }
    if (!esc[0].assigned_to) {
      return res.status(400).json({ error: 'No freelancer assigned to this job' });
    }

    // Get platform commission
    const { rows: cfg } = await query(
      `SELECT value FROM platform_config WHERE key = 'commission'`
    );
    const commissionRate = cfg.length ? (cfg[0].value?.rate || 15) : 15;
    const commission     = parseFloat((esc[0].amount * commissionRate / 100).toFixed(2));
    const payout         = parseFloat((esc[0].amount - commission).toFixed(2));

    await transaction(async (client) => {
      // Update escrow
      await client.query(
        `UPDATE escrows SET status = 'released', released_at = NOW() WHERE id = $1`,
        [escrowId]
      );
      // Update job
      await client.query(
        `UPDATE jobs SET payment_status = 'released' WHERE id = $1`,
        [esc[0].job_id]
      );
      // Credit freelancer wallet
      const { rows: w } = await client.query(
        'SELECT id, balance FROM wallets WHERE user_id = $1', [esc[0].assigned_to]
      );
      if (!w.length) throw new Error('Freelancer wallet not found');
      await client.query(
        `UPDATE wallets SET balance = balance + $1 WHERE id = $2`,
        [payout, w[0].id]
      );
      // Transaction record
      const ref = `REL-${escrowId.slice(0, 8).toUpperCase()}`;
      await client.query(
        `INSERT INTO transactions (wallet_id, type, entry_type, amount, reference, meta)
         VALUES ($1,'escrow_release','credit',$2,$3,$4)`,
        [w[0].id, payout, ref,
         JSON.stringify({ escrow_id: escrowId, job_id: esc[0].job_id, commission, commission_rate: commissionRate })]
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1,'payment.released','Payment Released! 💰',$2)`,
        [esc[0].assigned_to,
         `KES ${payout.toLocaleString()} has been released to your wallet (${commissionRate}% commission deducted)`]
      );
      await client.query(
        `INSERT INTO audit_log (user_id, action, description) VALUES ($1,'escrow.release',$2)`,
        [req.user.id,
         `Released KES ${payout} to freelancer (commission KES ${commission}) for job "${esc[0].job_title}"`]
      );
    });

    // Email freelancer
    const { rows: fl } = await query('SELECT email, name FROM users WHERE id = $1', [esc[0].assigned_to]);
    if (fl.length) {
      emailSvc.send(fl[0].email, 'paymentReleased', [fl[0].name, `KES ${payout.toLocaleString()}`]);
    }

    return res.json({ message: 'Payment released successfully', payout, commission });
  } catch (err) {
    logger.error('releaseEscrow error', { error: err.message });
    return res.status(500).json({ error: 'Failed to release payment' });
  }
}

/** GET /payments/wallet */
async function getWallet(req, res) {
  try {
    const { rows } = await query(
      'SELECT id, currency, balance, created_at FROM wallets WHERE user_id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Wallet not found' });
    return res.json({ wallet: rows[0] });
  } catch (err) {
    logger.error('getWallet error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load wallet' });
  }
}

/** GET /payments/transactions */
async function listTransactions(req, res) {
  try {
    const { rows: wallet } = await query(
      'SELECT id FROM wallets WHERE user_id = $1', [req.user.id]
    );
    if (!wallet.length) return res.json({ transactions: [] });

    const { rows } = await query(
      `SELECT * FROM transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [wallet[0].id]
    );
    return res.json({ transactions: rows });
  } catch (err) {
    logger.error('listTransactions error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load transactions' });
  }
}

module.exports = { depositEscrow, releaseEscrow, getWallet, listTransactions };
