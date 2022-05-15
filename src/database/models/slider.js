const mongoose = require('mongoose')

const sliderSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    header: {
        type: String
    },
    description: {
        type: String
    }
})

const Slider = mongoose.model('Slider', sliderSchema)

module.exports = Slider
