const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    doc_link:{
        type:String,
        required:true
    }
    
})

const Materials = mongoose.model('Materials', materialSchema)

module.exports = Materials
