const express = require('express');
const Order = require('../models/Order');
const Toy = require('../models/Toy');
const protect = require('../middleware/auth');

const router = express.Router();

// POST /api/orders  (protected) - place a "Buy now" / "Claim now" cash-on-delivery request
router.post('/', protect, async (req, res) => {
  try {
    const { toyId, phone, address } = req.body;
    if (!toyId || !phone || !address) {
      return res.status(400).json({ message: 'Phone and delivery address are required' });
    }

    const toy = await Toy.findById(toyId);
    if (!toy) return res.status(404).json({ message: 'Toy not found' });

    if (toy.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't order your own listing" });
    }
    if (toy.status !== 'available') {
      return res.status(400).json({ message: 'This toy is no longer available' });
    }

    const order = await Order.create({
      toy: toy._id,
      buyer: req.user._id,
      seller: toy.owner,
      phone,
      address,
      amount: toy.type === 'sale' ? toy.price : null,
    });

    toy.status = 'reserved';
    await toy.save();

    const populated = await order.populate([
      { path: 'toy' },
      { path: 'seller', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/mine  (protected) - orders I placed, as the buyer
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('toy')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/received  (protected) - incoming requests on toys I'm selling/giving
router.get('/received', protect, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('toy')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status  (protected)
// Seller can confirm / cancel / complete. Buyer can cancel their own pending order.
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id).populate('toy');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isSeller = order.seller.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();

    if (!isSeller && !(isBuyer && status === 'cancelled')) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    const toy = await Toy.findById(order.toy._id);
    if (toy) {
      if (status === 'cancelled') toy.status = 'available';
      if (status === 'completed') toy.status = 'taken';
      // 'confirmed' keeps the toy as 'reserved'
      await toy.save();
    }

    const populated = await order.populate([
      { path: 'toy' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
