const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/todo-calendar', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log('mongodb connected'), 
        error => handleError(error));

mongoose.connection.on('error', err => {
    logError(err);
});