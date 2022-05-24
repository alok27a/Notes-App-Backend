const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const User = require("../models/User")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// JSON Web Token used for verifying a user at every stage 
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'aloksec$et';

// POST Endpoint to /api/auth/createnewuser
router.post('/createnewuser',
    [
        // Validating using express validator 
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Enter a valid password').isLength({ min: 5 })
    ],
    async (req, res) => {

        // If there are errors return error with its message
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Check whether a user exists or not
            let user = await User.findOne({ email: req.body.email })
            if (user) {
                // If user already exists return error
                return res.status(400).json({ error: "User already exists" })
            }

            //  Hashing password using bcrypt
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // Creating a new user   
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            })

            // Creating auth token
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);

            // Sending response that user has been saved successfully 
            res.json({ authToken })

        } catch (error) {
            res.status(500).json({ message: error.message })
        }

    })



    
module.exports = router