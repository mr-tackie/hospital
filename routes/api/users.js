const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require("config");

//@route    POST api/users
//@desc     Register a user
//@access   Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'A valid email is required').isEmail(),
    check('password', 'Enter a password with 6 or more characters').isLength({min: 6}),
    check('type', 'A user type is required').not().isEmpty(),
], async (req, res) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        const {name, email, password, type} = req.body;

        //Check if user exists
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({errors: [{msg: 'User already exists'}]})
        }

        //get gravatar from email
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        //create a new user 
        user = new User({
            name, 
            email,
            avatar,
            password,
            type
        });

        //encrypt user password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        //save user
        await user.save();

        //return jwt
        const payload = {
            user: {
                id: user.id,
                type: user.type
            }
        }

        jwt.sign(
            payload, 
            config.get("jwtSecret"),
            {expiresIn: 3600},
            (err, token) => {
                if(err) throw err;
                res.json({token})
            }); //generates and returns a json web token with userId as the payload
    }catch(error){
        console.log(error.message);
        return res.status(500).send('Server error')
    }
});

module.exports = router;