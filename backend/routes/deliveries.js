const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const { protect } = require('../middleware/auth');

// GET /api/deliveries/my — volunteer's deliveries
router.get('/my', protect, async (req, res) => {
  try {
    const deliveries = await Delivery.find({ volunteer: req.user._id })
      .populate({
        path: 'foodPost',
        populate: { path: 'donor', select: '_id name phone email role' },
      })
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/deliveries/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.volunteer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your delivery' });

    const allowed = ['accepted', 'on_the_way', 'completed'];
    if (!allowed.includes(req.body.status))
      return res.status(400).json({ message: 'Invalid status' });

    delivery.status = req.body.status;
    await delivery.save();

    // If completed, mark the food post as delivered
    if (req.body.status === 'completed') {
      const FoodPost = require('../models/FoodPost');
      await FoodPost.findByIdAndUpdate(delivery.foodPost, { status: 'delivered' });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
