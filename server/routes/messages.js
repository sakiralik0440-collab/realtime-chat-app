const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const { uploadImage, uploadFile } = require('../middleware/upload');

// Send text message
router.post('/send', auth, async (req, res) => {
  try {
    const { roomId, content } = req.body;

    const newMessage = new Message({
      room: roomId,
      sender: req.user.id,
      content,
      messageType: 'text'
    });

    await newMessage.save();
    await Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email');

    res.status(201).json(populatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send image
router.post('/send-image', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const { roomId } = req.body;

    const newMessage = new Message({
      room: roomId,
      sender: req.user.id,
      content: '',
      messageType: 'image',
      fileUrl: req.file.path,
      fileName: req.file.originalname
    });

    await newMessage.save();
    await Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email');

    res.status(201).json(populatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send file
router.post('/send-file', auth, uploadFile.single('file'), async (req, res) => {
  try {
    const { roomId } = req.body;

    const newMessage = new Message({
      room: roomId,
      sender: req.user.id,
      content: '',
      messageType: 'file',
      fileUrl: req.file.path,
      fileName: req.file.originalname
    });

    await newMessage.save();
    await Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username email');

    res.status(201).json(populatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all messages in a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;