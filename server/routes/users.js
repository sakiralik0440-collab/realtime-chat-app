const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Search user by phone number

// Search user by phone number or name
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;

    // Search by phone or username
    const user = await User.findOne({
      $or: [
        { phone: query },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot search yourself' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start private 1-on-1 chat
router.post('/start-chat', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const existingRoom = await Room.findOne({
      isGroup: false,
      members: { $all: [req.user.id, userId] }
    }).populate('members', 'username phone isOnline');

    if (existingRoom) {
      return res.json({ room: existingRoom, isNew: false });
    }

    const otherUser = await User.findById(userId).select('-password');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newRoom = new Room({
      name: otherUser.username,
      members: [req.user.id, userId],
      createdBy: req.user.id,
      isGroup: false
    });

    await newRoom.save();

    const populatedRoom = await Room.findById(newRoom._id)
      .populate('members', 'username phone isOnline');

    res.status(201).json({ room: populatedRoom, isNew: true });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all contacts for logged in user
router.get('/contacts', auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user.id,
      isGroup: false
    })
      .populate('members', 'username phone isOnline')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const contacts = rooms.map(room => {
      const otherMember = room.members.find(
        m => m._id.toString() !== req.user.id
      );
      return {
        ...room.toObject(),
        name: otherMember?.username || room.name,
        phone: otherMember?.phone || '',
        isOnline: otherMember?.isOnline || false,
        otherUserId: otherMember?._id
      };
    });

    res.json(contacts);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get user online status
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, phone },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;