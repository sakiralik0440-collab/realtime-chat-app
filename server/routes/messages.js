const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Send a message — this must be FIRST
router.post('/send', auth, async (req, res) => {
  try {
    const { roomId, content } = req.body;

    const newMessage = new Message({
      room: roomId,
      sender: req.user.id,
      content
    });

    await newMessage.save();

    await Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email');

    res.status(201).json(populatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'server error', error: err.message });
  }
});

// Get all messages in a room — this must be SECOND
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: 'server error', error: err.message });
  }
});

module.exports = router;