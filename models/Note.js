const mongoose = require('mongoose');

const NotesSchema = mongoose.Schema({
      // this is like foreign key to identify notes of a particular user
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("notes",NotesSchema);