const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const session = require('express-session');
const methodOverride = require('method-override');

const path = require('path')
const userRouter = require('../api/routers/user')
const taskRouter = require('../api/routers/task')
const calendarRouter = require('../api/routers/calendar')
const reminderRouter = require('../api/routers/reminder')
require('./db/mongoose')

const sourcePath = path.join(__dirname, '../src')

const partialsPath = path.join(__dirname, '../templates/partials')
const viewsPath = path.join(__dirname, '../templates/views')
hbs.registerPartials(partialsPath)

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())                             // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))  // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'));

sessionConfiguration = {
    secret: 'velmi dlouhé slovo',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxage: 1000 * 60 * 60 * 24 * 7
    }
  }

app.use(session(sessionConfiguration))

app.use(express.static(sourcePath))

app.use(userRouter)
app.use(taskRouter)
app.use(calendarRouter)
app.use(reminderRouter)

app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.listen(port, () => {
    console.log('Server running on port:' + port)
})