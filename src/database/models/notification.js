const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    poster:{
        type:String
    }
})

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
