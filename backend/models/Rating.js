const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    delivery:  { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery',  required: true },
    donor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
    stars:     { type: Number, required: true, min: 1, max: 5 },
    note:      { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

// One rating per delivery
ratingSchema.index({ delivery: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
