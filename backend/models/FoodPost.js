const mongoose = require('mongoose');

const foodPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    quantity: { type: String, required: true },
    unit: {
      type: String,
      enum: ['kg', 'g', 'litre', 'ml', 'pieces', 'plates'],
      default: 'kg',
    },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    preparedTime: { type: Date, required: false },
    expiryTime: { type: Date, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['available', 'claimed', 'delivered', 'expired'],
      default: 'available',
    },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodPost', foodPostSchema);
