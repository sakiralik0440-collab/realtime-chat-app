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

// Delete a message
// Delete a message (soft delete)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.content = 'This message was deleted';
    message.isDeleted = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    res.json(updatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit a message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    res.json(updatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark all messages in room as read
router.post('/read/:roomId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        room: req.params.roomId,
        unreadBy: req.user.id
      },
      {
        $pull: { unreadBy: req.user.id },
        $addToSet: { readBy: req.user.id }
      }
    );

    res.json({ message: 'Messages marked as read' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get unread count for all rooms
router.get('/unread/counts', auth, async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          unreadBy: require('mongoose').Types.ObjectId.createFromHexString(req.user.id)
        }
      },
      {
        $group: {
          _id: '$room',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object { roomId: count }
    const result = {};
    counts.forEach(c => {
      result[c._id.toString()] = c.count;
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add or remove reaction
router.post('/:messageId/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with same emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction (toggle off)
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user.id && r.emoji === emoji)
      );
    } else {
      // Remove any previous reaction by this user
      message.reactions = message.reactions.filter(
        r => r.user.toString() !== req.user.id
      );
      // Add new reaction
      message.reactions.push({
        emoji,
        user: req.user.id,
        username: req.user.username
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    res.json(updatedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;