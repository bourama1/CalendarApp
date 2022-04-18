const express = require('express')
const session = require('express-session')
const User = require('../models/user')
const authenticate = require('../../src/middleware/authenticate')
const Task = require('../models/task')
const Reminder = require('../models/reminder')
const jwt = require('jsonwebtoken')
const router = new express.Router()

// GET register form
router.get('/register', async (req, res) => {
    const user_id = req.session.user_id
    const foundUser = await User.findById(user_id)
    const reminders = await Reminder.find({ owner: user_id, read: false })
    if (!foundUser) {
        return res.render('register', {
        title: 'Sign up'
    })
    }
    res.render('user', {
        title: 'Profile',
        user: foundUser,
        reminders: reminders
    })
})

// POST register form
router.post('/register', async (req, res) => {
    const { email, password}  = req.body
    const user = new User( {email, password} )
    try {
        await user.save()
        res.status(201)
        res.redirect('/users')
    } catch(e) {
        res.status(400)
        res.render('register', {
            title: 'Sign up',
            errorMessage: 'Bad password or already registered email'
        })
    }
})

// GET users, for log in users path to profile with all unread reminders, for not log in path to login
router.get('/users', async (req, res) => {
    const user_id = req.session.user_id
    const foundUser = await User.findById(user_id)
    const reminders = await Reminder.find({ owner: user_id, read: false })
    if (!foundUser) {
        return res.render('login', {
            title: 'Log in'
        })
    }
    res.render('user', {
        title: 'Profile',
        user: foundUser,
        reminders: reminders
    })  
})

// POST login form
router.post('/users', async (req, res) => {
    const { email, password}  = req.body
    try {
        const foundUser = await User.findByCredentials(email, password)
        if (!foundUser) {
            res.status(400)
            return res.redirect('/users')
        }
        req.session.user_id = foundUser._id
        /* get user token res.json({ token: jwt.sign({ email: foundUser.email, _id: foundUser._id }, 'RESTFULAPIs') }); */
        res.status(200)
        res.redirect('/users/me');
    } catch(e) {
        res.status(400)
        res.redirect('/users')
    }    
})

// GET profile of user with all unread reminders
router.get('/users/me', authenticate, async (req, res) => {
    const user_id = req.session.user_id
    const foundUser = await User.findById(user_id)
    const reminders = await Reminder.find({ owner: user_id, read: false })
    if (!foundUser) {
        res.status(400)
        return res.redirect('/users')
    }
    res.render('user', {
        title: 'Profile',
        user: foundUser,
        reminders: reminders
    })    
})

// GET logout of user and redirection to login 
router.get('/logout', authenticate, (req, res) => {
    req.session.user_id = null
    res.redirect('/users')
})

// GET update form for user
router.get('/users/me/update', authenticate, async (req, res) => {
    const search_data = { _id: req.session.user_id}
    try {
        const user = await User.findOne(search_data)
        if (!user){
            res.status(404)
            return res.redirect('/login')
        }

        res.render('user-update', {
            title: 'Update profile',
            user: user
        })    
    } catch(e) {
        res.status(500)
        res.redirect('/login')
    }   
})

// PATCH for updating user
router.patch('/users/me/update', authenticate, async (req, res) => {
    const search_data = { _id: req.session.user_id}
    const update_options = { useFindAndModify: false, new : true, runValidators : true }
    try {
        const user = await User.findOne(search_data, req.body, update_options)
        await user.save()
        if (!user) {
            res.status(404)
            return res.redirect('/users')
        }
        res.status(200)
        res.redirect('/tasks');
    } catch(e) {
        res.status(400)
        res.redirect('/users')
    }
})

// GET delete form for user
router.get('/users/me/delete', authenticate, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const user = await User.findOne({_id: user_id}, 'name email')
        if (!user){
            res.status(404)
            return res.redirect('/users')
        }

        const tasks = await Task.find({owner: user_id})
        res.render('user-delete', {
            title: 'Delete profile',
            user: user,
            tasks: tasks
        })    
    } catch(e) {
        res.status(500)
        res.redirect('/users')
    }   
})

// DELETE for deleting user
router.delete('/users/me/delete', authenticate, async (req, res) => {
    const user_id = req.session.user_id
    try {
        const user = await User.findOneAndDelete(user_id)        
        if (!user) {
            return res.status(404).redirect('/users')
        }
        const deletedCount = await Task.deleteMany({ owner: user._id })
        req.session.user_id = null
        res.redirect('/users')
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router