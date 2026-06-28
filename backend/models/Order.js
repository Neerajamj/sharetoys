const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    toy: { type: mongoose.Schema.Types.ObjectId, ref: 'Toy', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phone: { type: String, required: true, maxlength: 20 },
    address: { type: String, required: true, maxlength: 300 },
    paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
    // Snapshot of the price at order time (null for free toys), since the
    // listing's price could theoretically change later.
    amount: { type: Number, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
