const mongoose = require('mongoose')
const validator = require('validator')
const passwordValidator = require('password-validator')
const bcrypt = require('bcryptjs')

//password validation schema
const schema = new passwordValidator();
schema
.is().min(8)                                  
.has().uppercase()                            
.has().lowercase()                             
.has().digits()                                
.has().not().spaces()                           
.is().not().oneOf(['Password1']);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('This email is not valid')
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(!schema.validate(value))
                throw new Error('Password must have at least one uppercase, lowercase and digit character')
        }
    }
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('reminders', {
    ref: 'Reminder',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user){
        const error = 'User not found'
        console.log(error)
        return null
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch){
        const error = 'Wrong password'
        console.log(error)
        return null
    }
    return user
}

userSchema.pre('save', async function(next) {
    const user = this
    user.password = await bcrypt.hash(user.password, 12)
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User