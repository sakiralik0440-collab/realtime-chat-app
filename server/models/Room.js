const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    createdBy:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    isGroup:{
        type:Boolean,
        default:false
    },
    lastMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message',
        default:null
    }
},{timestamps:true});

module.exports = mongoose.model('Room',roomSchema);