const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Create a group
router.post('/create-group', auth, async (req, res) => {
  try {
    const { name, members } = req.body;

    const newRoom = new Room({
      name,
      members: [...members, req.user.id],
      createdBy: req.user.id,
      isGroup: true
    });

    await newRoom.save();

    const populatedRoom = await Room.findById(newRoom._id)
      .populate('members', 'username phone isOnline');

    res.status(201).json({
      message: 'Group created successfully',
      room: populatedRoom
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add member to group
router.post('/add-member', auth, async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    room.members.push(userId);
    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate('members', 'username phone isOnline');

    res.json({ message: 'Member added', room: updatedRoom });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all groups for logged in user
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await Room.find({
      members: req.user.id,
      isGroup: true
    })
      .populate('members', 'username phone isOnline')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(groups);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a room (group or chat)
router.delete('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only creator can delete group
    // Anyone can delete private chat
    if (room.isGroup && room.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group creator can delete' });
    }

    // Delete all messages in room
    await Message.deleteMany({ room: req.params.roomId });

    // Delete room
    await Room.findByIdAndDelete(req.params.roomId);

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove member from group
router.post('/remove-member', auth, async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Only creator can remove members
    if (room.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group creator can remove members' });
    }

    room.members = room.members.filter(m => m.toString() !== userId);
    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate('members', 'username phone isOnline');

    res.json({ message: 'Member removed', room: updatedRoom });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;
