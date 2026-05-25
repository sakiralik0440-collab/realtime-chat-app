const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Register 
router.post('/register',async (req,res) =>{
    try{
        const {username, email, password} = req.body;


        // for check user exist or not

        const  existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exist'}); 
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //create new user

        const newUser = new User({
            username,
            email,
            password : hashedPassword
        });

        await  newUser.save();

        //create json web token

        const token = jwt.sign(
            {id: newUser._id, username :newUser.username},
            process.env.JWT_SECRET,
            {
                expiresIn:'7d'
            }
        );
        res.status(201).json({
            message:'User registered successfully',
            token,
            user:{
                id:newUser._id,
                username: newUser.username,
                email:newUser.email
            }
        });  
    }catch (err){
        res.status(500).json({message: 'Server error', error:err.message});
    }
});

module.exports = router;