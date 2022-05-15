const mongoose = require('mongoose')


const LiveTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    test_id:{
        type:String
    },
    category: {
        type: String
    },
    sub_category: {
        type: String
    },
    time_limit: {
        type: Number
    },
    paid: {
        type: Boolean
    },
    published: {
        type: Boolean,

    },
    langauge: {
        type: String,
        default: 'English'
    },
    type:{
        type:String
    },
    attemped:{
        type:Number
    },
    correctAnswers:{
        type:Number
    },
    accuracy:{
        type:Number
    },
    timeTaken:{
        type:Number
    },
    wrongAnswers:{
        type:Number
    },
    questions_no: {
        type: Number,
    },
    questions: [{
        question: {
            type: String
        },
        question_hindi: {
            type:String
        },
        question_header: {
            type: String
        },
        que_img: {
            type: String
        },
        option_1: {
            type: String
        },
        option_2: {
            type: String
        },
        option_3: {
            type: String
        },
        option_4: {
            type: String
        },
        correct_option: {
            type: Number
        },
        explanation:{
            type:String
        },
    }],
    checked:{
        type:Boolean,
        default:false
    },
    doc_question:{
        type:String
    },
    doc_answer:{
        type:String
    },
    doc_solution:{
        type:String
    },
    positive_marks:{
        type:Number
    },
    negative_marks:{
        type:Number
    },
    marks:{
        type:Number
    },
    totalMarks:{
        type:Number
    },
    answers:[],
    solutions: {
        type: {
            type: String
        }
    },

})

const Usertest = mongoose.model('Usertest', LiveTestSchema)

module.exports = Usertest
