const mongoose = require('mongoose')

const DailynewsSchema = new mongoose.Schema({
    doc_link: {
        type: String
    },
    type:{
        type:String,
        default:'PDF'
    },
    title:{
        type:String
    }
})
const Dailynews = mongoose.model('Dailynews', DailynewsSchema)

module.exports = Dailynews
