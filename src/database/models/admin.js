const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    type:{
        type:String,
        default:'admin'
    },
    password: {
        type: String
    },
    contact_no: {
        type: Number
    },
    city: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    otp:{
        type:Number
    },
    token: {
        type: String
    },

})


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await Admin.findOne({
        email
    })
    if (!user) throw new Error('Email or  password is incorrect')
    console.log(user.password)
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if (!isMatch) throw new Error('Email or password is incorrect')
    return user
}
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.token
    return userObject
}
userSchema.methods.genAuthToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET)
    return token
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


const Admin = mongoose.model('Admin', userSchema)

module.exports = Admin