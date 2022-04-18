const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const session = require('express-session');
const authenticate = require('../../src/middleware/authenticate')
const moment = require('moment')

//GET calendar with all tasks for current user
router.get('/calendar', authenticate, async (req, res) => {
    const search_data = { owner: req.session.user_id}
    const tasks = await Task.find(search_data)
    res.render('calendar', {
        title: 'Calendar',
        tasks: tasks
    })
})

//GET tasks for chosen day
router.get('/day-tasks/:year/:month/:date', authenticate, async (req, res) => {
    var day = new Date(req.params.year, req.params.month, req.params.date);
    var momentDate = moment(day).startOf('day');
    const search_data = { date: {
        $gte: momentDate.toDate(),
        $lte: moment(momentDate).endOf('day').toDate()
    }, owner: req.session.user_id }
    const tasks = await Task.find(search_data)
    if (!tasks) {
        return res.status(500).send()
    }
    res.render('day-tasks', {
        title: 'Day tasks',
        tasks: tasks,
        date: moment(day).format('YYYY-MM-DD')
    })
})

module.exports = router