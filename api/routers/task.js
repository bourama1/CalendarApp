const express = require('express')
const Task = require('../models/task')
const Reminder = require('../models/reminder')
const router = new express.Router()
const moment = require('moment')
const session = require('express-session')
const authenticate = require('../../src/middleware/authenticate')

// GET all tasks for current user
router.get('/tasks', authenticate, async (req, res) => {
    const search_data = { owner: req.session.user_id}
    const tasks = await Task.find(search_data)
    if (!tasks) {
        return res.status(500).send()
    }
    res.render('task-list', {
        title: 'Task List',
        tasks: tasks
    })
})

// GET create form for task
router.get('/tasks/create', authenticate, async (req, res) => {
    res.render('task-create', {
        title: 'Create task'
    })
})

// POST for creating task, owner is automatically set to current user
router.post('/tasks/create', authenticate, async (req, res) => {
    const user_id = req.session.user_id
    const {title, description, date, priority} = req.body
    const task = new Task ({
        title: title,
        description: description,
        date: date,
        priority: priority,
        owner: user_id
    })
    try {
        await task.save()
        res.status(201)
        res.redirect('/tasks')
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET detail of task
router.get('/tasks/:id', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    const task = await Task.findOne(search_data)
    const reminder_search = { task: req.params.id, owner: req.session.user_id}
    const reminders = await Reminder.find(reminder_search)    
    if (!task) {
        return res.status(404).send()
    }
    res.render('task-detail', { 
        title: 'Task detail', 
        task:  task,
        reminders: reminders
    })
})

// GET update form for task
router.get('/tasks/:id/update', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    try {
        const task = await Task.findOne(search_data)
        if (!task){
            res.status(404)
            return res.redirect('/tasks')
        }
        res.render('task-update', {
            title: 'Update task',
            task: task,
            date: moment(task.date).format('YYYY-MM-DD')
        })    
    } catch(e) {
        res.status(500)
        res.redirect('tasks')
    }    
})


// PATCH for updating task
router.patch('/tasks/:id/update', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    const update_options = { useFindAndModify: false, new : true, runValidators : true }
    try {
        const task = await Task.findOneAndUpdate(search_data, req.body, update_options)
        if (!task) {
            return res.status(404).send()
        }
        //res.send(task)
        res.redirect('/tasks')
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET delete form for task
router.get('/tasks/:id/delete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    try {
        const task = await Task.findOne(search_data)
        if (!task) {
            return res.redirect('/tasks')
        }
        res.render('task-delete', {
            title: 'Delete task',
            task: task
        })
    } catch (e) {
        res.status(500).send()
    }
    
})

// DELETE for deleting task
router.delete('/tasks/:id/delete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}    
    const reminder_search = { task: req.params.id, owner: req.session.user_id}    
    try {
        const task = await Task.findOneAndDelete(search_data)
        const reminder = await Reminder.deleteMany(reminder_search)
        if (!task) {
            return res.status(404).send()
        }
        res.redirect('/tasks')
    } catch (e) {
        res.status(500).send()
    }
})

// GET form for confirmation of completing task
router.get('/tasks/:id/complete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    try {
        const task = await Task.findOne(search_data)
        if (!task){
            res.status(404)
            return res.redirect('/tasks')
        }    
        res.render('task-complete', {
            title: 'Complete task',
            task: task
        })
    } catch(e) {
        res.status(500)
        res.redirect('tasks')
    }    
})

// PATCH for confirmation of completing task
router.patch('/tasks/:id/complete', authenticate, async (req, res) => {
    const search_data = { _id: req.params.id, owner: req.session.user_id}
    const update_options = { useFindAndModify: false, new : true, runValidators : true }
    try {
        const task = await Task.findOneAndUpdate(search_data, update = { completed: true }, update_options)
        if (!task) {
            return res.status(404).send()
        }
        res.render('task-detail', {
            title: 'Task detail',
            task: task
        })
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router