const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
