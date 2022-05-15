const mongoose = require('mongoose')

const testSeriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    sub_category: {
        type: String
    },
    published: {
        type: Boolean,
    },
    langauge: {
        type: String,
        default: 'English'
    },
    price:{
        type:Number,
        default:20
    },
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

const Testseries = mongoose.model('Testseries', testSeriesSchema)

module.exports = Testseries
