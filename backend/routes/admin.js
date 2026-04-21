const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FoodPost = require('../models/FoodPost');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, donors, volunteers, ngos, totalPosts, deliveredPosts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'ngo' }),
      FoodPost.countDocuments(),
      FoodPost.countDocuments({ status: 'delivered' }),
    ]);
    res.json({ totalUsers, donors, volunteers, ngos, totalPosts, deliveredPosts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/posts
router.get('/posts', protect, adminOnly, async (req, res) => {
  try {
    const posts = await FoodPost.find()
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/admin/posts/:id
router.delete('/posts/:id', protect, adminOnly, async (req, res) => {
  try {
    const post = await FoodPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
