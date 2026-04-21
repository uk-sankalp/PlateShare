const express = require('express');
const router  = express.Router();
const Rating  = require('../models/Rating');
const Delivery = require('../models/Delivery');
const FoodPost = require('../models/FoodPost');
const { protect } = require('../middleware/auth');

// ── POST /api/ratings ────────────────────────────────────────────────────────
// Donor submits a rating for a completed delivery
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can rate volunteers' });
    }

    const { deliveryId, stars, note } = req.body;
    if (!deliveryId || !stars) {
      return res.status(400).json({ message: 'deliveryId and stars are required' });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Stars must be between 1 and 5' });
    }

    // Verify delivery exists, is completed, and belongs to this donor's food post
    const delivery = await Delivery.findById(deliveryId).populate('foodPost');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed deliveries' });
    }

    const foodPost = await FoodPost.findById(delivery.foodPost);
    if (!foodPost || foodPost.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your donation' });
    }

    // Prevent duplicate
    const existing = await Rating.findOne({ delivery: deliveryId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this delivery' });
    }

    const rating = await Rating.create({
      delivery:  deliveryId,
      donor:     req.user._id,
      volunteer: delivery.volunteer,
      stars,
      note: note || '',
    });

    res.status(201).json(rating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already rated this delivery' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/ratings/my ──────────────────────────────────────────────────────
// Returns all rating delivery IDs submitted by the logged-in donor
router.get('/my', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ donor: req.user._id }).select('delivery stars');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/ratings/volunteer/:id ───────────────────────────────────────────
// Public: get all ratings + average for a volunteer
router.get('/volunteer/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ volunteer: req.params.id })
      .populate('donor', 'name')
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const averageStars = totalRatings
      ? +(ratings.reduce((s, r) => s + r.stars, 0) / totalRatings).toFixed(1)
      : 0;

    res.json({ ratings, averageStars, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
