const express = require('express')
const Reminder = require('../models/reminder')
const Task = require('../models/task')
const router = new express.Router()
const moment = require('moment')
const session = require('express-session')
const authenticate = require('../../src/middleware/authenticate')

// GET all reminders for current user
router.get('/reminders', authenticate, async (req, res) => {
    const search_data = { owner: req.session.user_id}
    const reminders = await Reminder.find(search_data)
    if (!reminders) {
        return res.status(500).send()
    }
    res.render('reminder-list', {
        title: 'Reminder List',
        reminders: reminders
    })
})

// GET create form for reminder
router.get('/reminders/create', authenticate, async (req, res) => {
    const search_data = { owner: req.session.user_id}
    const tasks = await Task.find(search_data)
    res.render('reminder-create', {
        title: 'Reminder task',
        tasks: tasks
    })
})

// POST for create reminder, owner is automatically set to current user
router.post('/reminders/create', authenticate, async (req, res) => {
    const user_id = req.session.user_id
    const {title, date, task} = req.body
    const reminder = new Reminder ({
        title: title,
        date: date,
        task: task,
        owner: user_id
    })
    try {
        await reminder.save()
        res.status(201)
        res.redirect('/reminders')
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET detail of reminder with link to task that he should remind
router.get('/reminders/:id', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    const reminder = await Reminder.findOne(search_data)
    const task = await Task.findOne( { _id: reminder.task })
    if (!reminder) {
        return res.status(404).send()
    }
    res.render('reminder-detail', { 
        title: 'Reminder detail', 
        reminder: reminder,
        task: task
    })
})

// GET update form for reminder
router.get('/reminders/:id/update', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    try {
        const reminder = await Reminder.findOne(search_data)
        if (!reminder){
            res.status(404)
            return res.redirect('/reminders')
        }
        res.render('reminder-update', {
            title: 'Update reminder',
            reminder: reminder,
            date: moment(reminder.date).format('YYYY-MM-DD')
        })    
    } catch(e) {
        res.status(500)
        res.redirect('reminders')
    }
})

    
// PATCH for updating reminder
router.patch('/reminders/:id/update', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    const update_options = { useFindAndModify: false, new : true, runValidators : true }
    try {
        const reminder = await Reminder.findOneAndUpdate(search_data, req.body, update_options)
        if (!reminder) {
            return res.status(404).send()
        }
        res.redirect('/reminders')
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET delete form for reminder
router.get('/reminders/:id/delete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    try {
        const reminder = await Reminder.findOne(search_data)
        if (!reminder) {
            return res.redirect('/reminders')
        }
        res.render('reminder-delete', {
            title: 'Delete reminder',
            reminder: reminder
        })
    } catch (e) {
        res.status(500).send()
    }  
})
    
// DELETE for deleting reminder
router.delete('/reminders/:id/delete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    try {
        const reminder = await Reminder.findOneAndDelete(search_data)
        
        if (!reminder) {
            return res.status(404).send()
        }
        res.redirect('/reminders')
    } catch (e) {
        res.status(500).send()
    }
})

// GET form for confirmation of reading reminder
router.get('/reminders/:id/read', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    try {
        const reminder = await Reminder.findOne(search_data)
        if (!reminder){
            res.status(404)
            return res.redirect('/reminders')
        }    
        res.render('reminder-read', {
            title: 'Confirm reading reminder',
            reminder: reminder
        })
    } catch(e) {
        res.status(500)
        res.redirect('reminders')
    }    
})

// PATCH for confirmation of reading reminder
router.patch('/reminders/:id/read', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    const update_options = { useFindAndModify: false, new : true, runValidators : true }
    try {
        const reminder = await Reminder.findOneAndUpdate(search_data, update = { read: true }, update_options)
        if (!reminder) {
            return res.status(404).send()
        }
        const task = await Task.findOne( { _id: reminder.task })
        res.render('reminder-detail', {
            title: 'Reminder detail',
            reminder: reminder,
            task: task
        })
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router