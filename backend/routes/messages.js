const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Delivery = require('../models/Delivery');
const { protect } = require('../middleware/auth');
const { sendNotification } = require('./notifications');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `msg-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// GET /api/messages/:deliveryId
// Fetch all messages for a specific delivery
router.get('/:deliveryId', protect, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Ensure the user is either the volunteer or the donor
    const FoodPost = require('../models/FoodPost');
    const foodPost = await FoodPost.findById(delivery.foodPost);

    if (delivery.volunteer.toString() !== req.user._id.toString() &&
        foodPost.donor.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ delivery: req.params.deliveryId })
      .sort({ createdAt: 1 });

    // Mark as read: find messages the current user received that are still unread
    const unread = messages.filter(
      m => m.receiver.toString() === req.user._id.toString() && !m.read
    );

    if (unread.length > 0) {
      const unreadIds = unread.map(m => m._id);
      await Message.updateMany({ _id: { $in: unreadIds } }, { read: true });

      // Notify each unique sender that their messages were read
      const senderIds = [...new Set(unread.map(m => m.sender.toString()))];
      senderIds.forEach(senderId => {
        sendNotification({
          type: 'MESSAGES_READ',
          deliveryId: req.params.deliveryId,
          readIds: unreadIds.map(id => id.toString()),
        }, senderId);
      });

      // Return messages with updated read status
      return res.json(messages.map(m =>
        unreadIds.some(id => id.toString() === m._id.toString())
          ? { ...m.toObject(), read: true }
          : m.toObject()
      ));
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST /api/messages/upload
// Upload an image for a chat message
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  
  res.json({ imageUrl: `/${req.file.path.replace(/\\/g, '/')}` });
});

// POST /api/messages
// Send a new message
router.post('/', protect, async (req, res) => {
  try {
    const { deliveryId, receiverId, text, imageUrl } = req.body;
    if (!deliveryId || !receiverId || (!text && !imageUrl)) {
      return res.status(400).json({ message: 'Missing required fields or empty message' });
    }

    const message = await Message.create({
      delivery: deliveryId,
      sender: req.user._id,
      receiver: receiverId,
      text: text || '',
      imageUrl: imageUrl || ''
    });

    // Notify the receiver via SSE with enriched payload
    sendNotification({
      type: 'CHAT_MESSAGE',
      title: `💬 New message from ${req.user.name}`,
      message: text ? (text.length > 60 ? text.slice(0, 60) + '…' : text) : '📷 Sent an image',
      data: {
        ...message.toObject(),
        senderName: req.user.name,
        senderRole: req.user.role,
        deliveryId,
      }
    }, receiverId);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
