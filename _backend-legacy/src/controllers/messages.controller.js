// src/controllers/messages.controller.js
'use strict';

const { query, transaction } = require('../db/pool');
const logger = require('../utils/logger');

/** GET /messages/conversations */
async function listConversations(req, res) {
  try {
    const { rows } = await query(
      `SELECT c.id, c.participants, c.last_message, c.last_msg_at, c.created_at,
              (SELECT COUNT(*) FROM messages m
               WHERE m.convo_id = c.id AND m.recipient_id = $1 AND m.is_read = FALSE
              ) AS unread_count
       FROM conversations c
       WHERE $1 = ANY(c.participants)
       ORDER BY c.last_msg_at DESC NULLS LAST`,
      [req.user.id]
    );
    // Attach other participant info
    const userIds = [...new Set(rows.flatMap(c => c.participants).filter(id => id !== req.user.id))];
    let users = [];
    if (userIds.length) {
      const { rows: u } = await query(
        `SELECT id, name, avatar_url FROM users WHERE id = ANY($1)`,
        [userIds]
      );
      users = u;
    }
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    const enriched = rows.map(c => ({
      ...c,
      other_user: userMap[c.participants.find(id => id !== req.user.id)] || null,
    }));
    return res.json({ conversations: enriched });
  } catch (err) {
    logger.error('listConversations error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load conversations' });
  }
}

/** POST /messages/conversations  — create or get existing */
async function startConversation(req, res) {
  const { recipient_id, message } = req.body;
  if (!recipient_id || !message?.trim()) {
    return res.status(400).json({ error: 'recipient_id and message required' });
  }
  if (recipient_id === req.user.id) {
    return res.status(400).json({ error: 'Cannot message yourself' });
  }
  try {
    const { rows: exists } = await query(
      `SELECT id FROM conversations
       WHERE participants @> ARRAY[$1::uuid, $2::uuid]`,
      [req.user.id, recipient_id]
    );

    let convoId;
    if (exists.length) {
      convoId = exists[0].id;
    } else {
      const { rows } = await query(
        `INSERT INTO conversations (participants) VALUES (ARRAY[$1::uuid, $2::uuid]) RETURNING id`,
        [req.user.id, recipient_id]
      );
      convoId = rows[0].id;
    }

    const { rows: msg } = await query(
      `INSERT INTO messages (convo_id, sender_id, recipient_id, body)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [convoId, req.user.id, recipient_id, message.trim()]
    );
    await query(
      `UPDATE conversations SET last_message = $1, last_msg_at = NOW() WHERE id = $2`,
      [message.trim().slice(0, 200), convoId]
    );

    // Notify recipient
    await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1,'message.new',$2,$3)`,
      [recipient_id, `Message from ${req.user.name}`, message.trim().slice(0, 100)]
    ).catch(() => {});

    return res.status(201).json({ conversation_id: convoId, message: msg[0] });
  } catch (err) {
    logger.error('startConversation error', { error: err.message });
    return res.status(500).json({ error: 'Failed to start conversation' });
  }
}

/** GET /messages/conversations/:id  — messages in a conversation */
async function getMessages(req, res) {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    // Verify user is a participant
    const { rows: c } = await query(
      `SELECT id FROM conversations WHERE id = $1 AND $2 = ANY(participants)`,
      [req.params.id, req.user.id]
    );
    if (!c.length) return res.status(403).json({ error: 'Access denied' });

    const { rows } = await query(
      `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.convo_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [req.params.id, parseInt(limit), offset]
    );

    // Mark messages to this user as read
    await query(
      `UPDATE messages SET is_read = TRUE
       WHERE convo_id = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [req.params.id, req.user.id]
    ).catch(() => {});

    return res.json({ messages: rows });
  } catch (err) {
    logger.error('getMessages error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}

/** POST /messages/conversations/:id/messages  — send a message */
async function sendMessage(req, res) {
  const { body: msgBody } = req.body;
  if (!msgBody?.trim()) return res.status(400).json({ error: 'Message body required' });

  try {
    const { rows: c } = await query(
      `SELECT id, participants FROM conversations WHERE id = $1 AND $2 = ANY(participants)`,
      [req.params.id, req.user.id]
    );
    if (!c.length) return res.status(403).json({ error: 'Access denied' });

    const recipientId = c[0].participants.find(id => id !== req.user.id);

    const { rows } = await query(
      `INSERT INTO messages (convo_id, sender_id, recipient_id, body)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, req.user.id, recipientId, msgBody.trim()]
    );
    await query(
      `UPDATE conversations SET last_message = $1, last_msg_at = NOW() WHERE id = $2`,
      [msgBody.trim().slice(0, 200), req.params.id]
    );
    await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1,'message.new',$2,$3)`,
      [recipientId, `Message from ${req.user.name}`, msgBody.trim().slice(0, 100)]
    ).catch(() => {});

    return res.status(201).json({ message: rows[0] });
  } catch (err) {
    logger.error('sendMessage error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

module.exports = { listConversations, startConversation, getMessages, sendMessage };
