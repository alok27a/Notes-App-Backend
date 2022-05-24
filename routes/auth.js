const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const User = require("../models/User")
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// JSON Web Token used for verifying a user at every stage 
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'aloksec$et';
const fetchuser = require('../middleware/fetchUser')


// ROUTE 1 : POST Endpoint to /api/auth/createnewuser
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


// ROUTE 2 :  Authentication of login of a user "/api/auth/login"
router.post('/login',
    [
        // Validating using express validator 
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password cannot be blank').exists()
    ],
    async (req, res) => {

        // If there are errors return error with its message
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Destructuring the input given by user
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ error: "Please try to login with correct credential" })
            }
            let compPass = await bcrypt.compare(password, user.password);
            if (!compPass) {
                return res.status(400).json({ error: "Please try to login with correct credential" })
            }
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

// ROUTE 3 : TO get all the details of a particular user
router.post('/getuser', fetchuser, async (req, res) => {
        try {
            let userId = req.user.id
            const user = await User.findById(userId).select("-password")
            res.send(user)
        } catch (error) {
            console.log(error.message)
            res.status(400).send("Internal error")
        }
    })


module.exports = router