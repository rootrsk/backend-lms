const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username:{
        type: String
    },
    password:{
        type:String
    },
    contact_no : {
        type:Number
    },
    city:{
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase : true,
    },
    token:{
        type:String
    },
    verified:{
        type:Boolean,
        default: false
    },
    otp:{
        type:Number
    },
    mytests:[],
    completed_tests:[{type:mongoose.Schema.Types.ObjectId,ref:'Usertest'}],
    test_series:[{type:mongoose.Schema.Types.ObjectId,ref:'Testseries'}],
    completed:[{type:mongoose.Schema.Types.ObjectId,ref:'Test'}],
    courses:[{
        _id: false,
        course:{
            type:String 
        },
        created:{
            type:Date
        },
        expiryDate:{
            type:Date
        },
        expired:{
            type:Boolean
        }
    }]

},{ timestamps: true })


userSchema.statics.findByCredentials= async(email,password)=>{
    console.log(email, password)
    const user = await  User.findOne({email})
    
    if(!user) 
        return {
            user:null,
            error:"User Not Found."
        }
    console.log(user.password)
    const isMatch =  await bcrypt.compare(password,user.password)
    console.log(isMatch)
    if(!isMatch) throw new Error('Email or password is incorrect')
    return {
        user,
        error:null
    }
}
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.token
    return userObject
}
userSchema.methods.genAuthToken = async function(){
    const user = this
    console.log(user._id)
    const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET)
    return token
}
userSchema.methods.emailToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    return token
}
userSchema.pre('save',async function(next){
    const user = this 
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


const User = mongoose.model('User',userSchema)

module.exports = User