const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const fetchuser = require('../middleware/fetchUser')
const Note = require("../models/Note")
const { body, validationResult } = require('express-validator');


// ROUTE 1 : to fetch all notes 
router.get('/fetchallnotes', fetchuser,
    async (req, res) => {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    })


// ROUTE 2 : to store all notes 
router.post('/addnote', fetchuser,
    [
        body('title', 'Title cannot be blank').isLength({ min: 3 }),
        body('description', 'Description cannot be blank').isLength({ min: 3 })
    ],
    async (req, res) => {

        try {
            const { title, description, tag } = req.body;

            // If there are errors return error with its message
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.message)
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save();
            res.json(savedNote)

        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: error.message })
        }
    })

// ROUTE 3 : Update all notes 


module.exports = router