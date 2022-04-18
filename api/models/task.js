const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    priority: {
        type: Number
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

taskSchema.virtual('reminders', {
    ref: 'Reminder',
    localField: '_id',
    foreignField: 'task'
})

taskSchema.virtual('url').get(function(){
    return '/tasks/' + this._id
})

// Returns a date in 'yyyy-MM-dd' format
taskSchema.methods.formatDate = function(dateProperty) {
    const newDate = new Date(this[dateProperty]);
    let formattedDate = `${ newDate.getFullYear() }-`;
        formattedDate += `${ `0${ newDate.getMonth() + 1 }`.slice(-2) }-`;  // for double digit month
        formattedDate += `${ `0${ newDate.getDate() }`.slice(-2) }`;        // for double digit day
    return formattedDate;
}

const Task = mongoose.model('Task', taskSchema)

module.exports = Task