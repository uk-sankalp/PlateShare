const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Global array to keep track of active SSE clients
let clients = [];

// GET /api/notifications/stream
router.get('/stream', protect, (req, res) => {
  // Headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    userId: req.user._id,
    res
  };

  clients.push(newClient);

  // Send initial signal
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Remove client when connection closes
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Helper function to send notification to all/specific clients
const sendNotification = (notification, targetUserId = null) => {
  clients.forEach(client => {
    if (targetUserId) {
      if (client.userId.toString() === targetUserId.toString()) {
        client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    } else {
      client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  });
};

module.exports = {
  router,
  sendNotification
};
