const mongoose = require('mongoose')

const LiveTestSchema  =new  mongoose.Schema({
    title :{
        type: String,
        required: true
    },
    category:{
        type:String
    },
    sub_category: {
        type:String
    },
    time_limit:{
        type:Number,
        trim: true,
    },
    paid:{
        type:Boolean
    },
    published:{
        type:Boolean,
    },
    langauge:{
        type:String,
        default: 'English'
    },
    type:{
        type:String,
        default:'Quiz'
    },
    questions:[{
        question:{
            type:String
        },
        question_hindi:{
            type:String
        },
        question_header:{
            type:String
        },
        que_img:{
            type:String
        },
        option_1: {
            type:String
        },
        option_2:{
            type:String
        },
        option_3:{
            type:String
        },
        option_4:{
            type:String
        },
        correct_option:{
            type:Number
        },
        explanation:{
            type:String
        }
    }],
    positive_marks:{
        type:Number,
        default:1
    },
    negative_marks:{
        type:Number,
        default:0
    },
    questions_no:{
        type:Number,
    },
    doc_question:{
        type:String
    },
    doc_answer:{
        type:String
    },
    solutions:{
        type:{
            type:String
        }
    },
    

    users:[{
        _id:false,
        id:String,
        marks:Number
    }]

})

const Test = mongoose.model('Test',LiveTestSchema)

module.exports = Test


