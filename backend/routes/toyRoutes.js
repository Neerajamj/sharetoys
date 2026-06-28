const express = require('express');
const Toy = require('../models/Toy');
const protect = require('../middleware/auth');

const router = express.Router();

// GET /api/toys?type=free|sale&search=lego
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = {};
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const toys = await Toy.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(toys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/toys/:id  (single toy detail)
router.get('/:id', async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id).populate('owner', 'name email');
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    res.json(toy);
  } catch (err) {
    res.status(500).json({ message: 'Toy not found' });
  }
});

// POST /api/toys  (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, condition, type, price, description, imageUrl, location } = req.body;
    if (!name || !category || !type) {
      return res.status(400).json({ message: 'Name, category and type are required' });
    }
    if (type === 'sale' && (!price || Number(price) <= 0)) {
      return res.status(400).json({ message: 'Provide a price for items listed for sale' });
    }
    const toy = await Toy.create({
      name,
      category,
      condition,
      type,
      price: type === 'sale' ? price : null,
      description,
      imageUrl,
      location,
      owner: req.user._id,
    });
    const populated = await toy.populate('owner', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/toys/:id/status  (protected, owner only) - mark as taken or available
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'taken'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "available" or "taken"' });
    }
    const toy = await Toy.findById(req.params.id);
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    if (toy.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own listings' });
    }
    toy.status = status;
    await toy.save();
    const populated = await toy.populate('owner', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/toys/:id  (protected, owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id);
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    if (toy.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only remove your own listings' });
    }
    await toy.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
