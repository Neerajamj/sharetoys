const mongoose = require('mongoose');

const toySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, required: true },
    condition: {
      type: String,
      enum: ['Like new', 'Gently used', 'Well loved', 'Needs minor repair'],
      default: 'Gently used',
    },
    type: { type: String, enum: ['free', 'sale'], required: true },
    price: { type: Number, min: 0, default: null },
    description: { type: String, maxlength: 400 },
    imageUrl: { type: String },
    location: { type: String, maxlength: 100 },
    status: { type: String, enum: ['available', 'reserved', 'taken'], default: 'available' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Toy', toySchema);
