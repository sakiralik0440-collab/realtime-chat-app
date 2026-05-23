const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
     room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  }
}, { timestamps: true });

module.exports = mongoose.model('Message',messageSchema);