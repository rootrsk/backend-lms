const mongoose = require('mongoose')

const interviewSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    fathername: {
        type: String
    },
    contactnumber: {
        type: Number
    },
    email:{
        type:String
    },
    age:{
        type:Number
    },
    gender:{
        type:String,
        default:'Male'
    },
    address:{
        type:String
    },
    exam:{
        type:String
    },
    checked:{
        type:Boolean
    }
})

const Interview = mongoose.model('Interview', interviewSchema)

module.exports = Interview
                                                       