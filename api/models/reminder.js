const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

reminderSchema.virtual('url').get(function(){
    return '/reminders/' + this._id
})

const Reminder = mongoose.model('Reminder', reminderSchema)

module.exports = Reminder