const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    foodPost: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodPost', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['accepted', 'on_the_way', 'completed'],
      default: 'accepted',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
