const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');


router.post('/create', auth, async (req, res) => {
  try {
    const { name, members, isGroup } = req.body;

    const roomMembers = members ? [...members, req.user.id] : [req.user.id];

    const newRoom = new Room({
      name,
      members: roomMembers,
      createdBy: req.user.id,
      isGroup: isGroup || false
    });

    await newRoom.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// get all rooms

router.get('/',auth,async (req,res) =>{
    try{
        const rooms = await Room.find({members:req.user.id})
        .populate('members','username email isOnline')
        .populate('lastMessage')
        .sort({ updatedAt:-1});

        res.json(rooms);

    }catch(err){
        res.status(500).json({message:'server error',error:err.message});

    }
});
 module.exports = router;
