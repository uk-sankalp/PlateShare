const express = require('express');
const router = express.Router();
const FoodPost = require('../models/FoodPost');
const Delivery = require('../models/Delivery');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // e.g. food-1634567890123.jpg
    cb(null, `food-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
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

// Haversine distance in km
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// GET /api/food — all available posts, optionally filtered by location
router.get('/', protect, async (req, res) => {
  try {
    const posts = await FoodPost.find({ 
      status: 'available',
      expiryTime: { $gt: new Date() }
    })
      .populate('donor', 'name email phone organization role')
      .sort({ createdAt: -1 });

    const { lat, lng, radius } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxKm = parseFloat(radius) || 50;

    let result = posts.map((p) => {
      const obj = p.toObject();
      if (userLat && userLng && p.coordinates?.lat && p.coordinates?.lng) {
        obj.distanceKm = parseFloat(
          haversine(userLat, userLng, p.coordinates.lat, p.coordinates.lng).toFixed(1)
        );
      } else {
        obj.distanceKm = null;
      }
      return obj;
    });

    if (userLat && userLng) {
      result = result.filter((p) => p.distanceKm === null || p.distanceKm <= maxKm);
      result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/food/my — donor's own posts
router.get('/my', protect, async (req, res) => {
  try {
    const posts = await FoodPost.find({ donor: req.user._id })
      .populate('claimedBy', '_id name email phone role')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch associated deliveries for claimed/delivered posts
    const postIds = posts.filter(p => p.status !== 'available').map(p => p._id);
    const deliveries = await Delivery.find({ foodPost: { $in: postIds } });

    const result = posts.map(p => {
      const delivery = deliveries.find(d => d.foodPost.toString() === p._id.toString());
      if (delivery) {
        p.deliveryId = delivery._id;
      }
      return p;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/food/impact — overall impact metrics (public)
router.get('/impact', async (req, res) => {
  try {
    const deliveredPosts = await FoodPost.find({ status: 'delivered' });
    let totalKgs = 0;
    let peopleHelped = 0;

    deliveredPosts.forEach((post) => {
      const qty = parseFloat(post.quantity) || 0;
      if (post.unit === 'kg' || post.unit === 'litre') {
        totalKgs += qty;
        peopleHelped += qty * 3;
      } else if (post.unit === 'g' || post.unit === 'ml') {
        totalKgs += qty / 1000;
        peopleHelped += (qty / 1000) * 3;
      } else if (post.unit === 'pieces' || post.unit === 'plates') {
        totalKgs += qty * 0.3; // estimate 300g per plate/piece
        peopleHelped += qty;
      }
    });

    res.json({
      totalFoodShared: Math.round(totalKgs),
      peopleHelped: Math.round(peopleHelped),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST /api/food/upload — upload food image
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  
  // Return the path that the frontend can use to access the image
  // e.g. /uploads/food-1634567890123.jpg
  res.json({ imageUrl: `/${req.file.path.replace(/\\/g, '/')}` });
});


// POST /api/food — create food post (donor only)
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'donor')
    return res.status(403).json({ message: 'Only donors can post food' });

  const { title, quantity, unit, location, expiryTime, description, coordinates, imageUrl } = req.body;
  if (!title || !quantity || !location || !expiryTime)
    return res.status(400).json({ message: 'Please fill all required fields' });

  try {
    const post = await FoodPost.create({
      title, quantity, unit: unit || 'kg', location,
      coordinates: coordinates || { lat: null, lng: null },
      expiryTime, description, imageUrl: imageUrl || '', donor: req.user._id,
    });
    const populated = await post.populate('donor', 'name email');
    
    // Trigger real-time notification
    const { sendNotification } = require('./notifications');
    sendNotification({
      type: 'NEW_FOOD',
      title: 'New Food Posted Nearby!',
      message: `${title} is now available at ${location}`,
      data: populated
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/food/:id/claim
router.patch('/:id/claim', protect, async (req, res) => {
  try {
    // Donors cannot claim food — only volunteers and NGOs can
    if (req.user.role === 'donor') {
      return res.status(403).json({ message: 'Donors cannot claim food posts' });
    }

    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Food post not found' });
    if (post.status !== 'available')
      return res.status(400).json({ message: 'This food has already been claimed' });


    post.status = 'claimed';
    post.claimedBy = req.user._id;
    await post.save();
    await Delivery.create({ foodPost: post._id, volunteer: req.user._id });

    // Populate fields to send rich notification to the donor
    const populated = await FoodPost.findById(post._id)
      .populate('donor', '_id name')
      .populate('claimedBy', 'name role');

    const { sendNotification } = require('./notifications');
    const claimerRole = populated.claimedBy.role === 'ngo' ? 'NGO' : (populated.claimedBy.role.charAt(0).toUpperCase() + populated.claimedBy.role.slice(1));

    // 1. Notify the donor (targeted)
    sendNotification(
      {
        type: 'FOOD_CLAIMED',
        title: '🎉 Your Food Has Been Claimed!',
        message: `Your food "${populated.title}" has been successfully claimed by ${populated.claimedBy.name} (${claimerRole}).`,
        data: {
          foodTitle: populated.title,
          claimedByName: populated.claimedBy.name,
          claimedByRole: claimerRole,
        },
      },
      populated.donor._id
    );

    // 2. Broadcast to ALL clients so they remove this food from their notification panel
    sendNotification({
      type: 'FOOD_REMOVED',
      foodPostId: post._id.toString(),
    });

    res.json({ message: 'Food claimed successfully', post });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/food/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Food post not found' });
    const allowed = ['available', 'claimed', 'delivered', 'expired'];
    if (!allowed.includes(req.body.status))
      return res.status(400).json({ message: 'Invalid status' });
    post.status = req.body.status;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/food/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Food post not found' });
    if (post.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Food post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
