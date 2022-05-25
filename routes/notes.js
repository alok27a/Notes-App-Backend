const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const fetchuser = require('../middleware/fetchUser')
const Note = require("../models/Note")
const { body, validationResult } = require('express-validator');
const { findByIdAndUpdate } = require('../models/Note');


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
router.put('/updatenote/:id', fetchuser,
    async (req, res) => {
        const { title, description, tag } = req.body;
        // Create a newnote object
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        //  Find the note and update it 
        // But first we need to verify whether its the same user note or not
        let note = await Note.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorised access");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })

    })

// ROUTE 3 : Delete  all notes using delete 
router.delete('/deletenote/:id', fetchuser,
    async (req, res) => {
    
        //  Find the note and delete it 
        // But first we need to verify whether its the same user note or not
        let note = await Note.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Not found");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorised access");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "message":"Success note has been deleted" })

    })



module.exports = router