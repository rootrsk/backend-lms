const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    discount_code: {
        type: String,
        required: true
    },
    discount_percentage: {
        type: String
    },
    product_type:{
        type:String,
        default:'course'
    }
})

const Coupon = mongoose.model('Coupon', couponSchema)

module.exports = Coupon
