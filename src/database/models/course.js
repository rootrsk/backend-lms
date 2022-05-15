const mongoose = require('mongoose')
const User = require('./user')

//Courese Schema 
const courseSchema = new mongoose.Schema({
    course_name : {
        type:String,
        required : true,
        unique : true,
    },
    teacher_name : {
        type:String,
        required : true
    },
    description:{
        type:String,
    },
    poster: {
        type: String
    },  
    price:{
        type:Number
    },
    published: {
        type: Boolean
    },
    type:{
        type:Number
    },
    product_type:{
        type:String,
        default:'course'
    },
    preview_videos:[{
        title:{
            type:String
        },
        video_link:{
            type:String
        }
    }],
    chapters:[{
        title:{
            type:String
        },
        description:{
            type:String
        },
        
        videos: [{
            title:{
                type:String
            },
            link:{
                type: String
            },
            description: {
                type:String
            }
        }]
    }],
    users:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    liveLink:{
        type:String
    },
    tests:[{
        type:mongoose.Schema.Types.ObjectId,ret:'Test'
    }],
    study_material:[{
        title:{
            type:String
        },
        doc_link:{
            type:String
        },
        type:{
            type:String,
            default:'pdf'
        }
    }],
    practice_set:[{
        title:{
            type:String
        },
        question_link:{
            type:String,
        },
        answer_link:{
            type:String
        },
        type:{
            type:String,
            default:'pdf'
        }
    }]
    
})

//Course Model
const Course = mongoose.model('Course',courseSchema)

module.exports = Course