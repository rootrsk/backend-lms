const express = require('express')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const userAuth = require("../middleware/userAuth");
const User = require('../database/models/user');
const Course = require('../database/models/course');
const sendMail = require('../middleware/welcomeMessage')
const sendVerifyEmail = require('../middleware/email/emailVerification')
// const sendVefifyEmail = require('../middleware/verifyEmail');
const { json } = require('body-parser');
const Usertest = require('../database/models/userTest');
const sendNotification = require('../middleware/email/notification');

//Signup Details 
router.post('/signup', async (req, res) => {
    
    try {
        const data = Object.keys(req.body)
        const allowedFields = ['username','password','email','contact_no','city']
        const isValidField = data.every((field) => allowedFields.includes(field))
        
        if(!isValidField){
            throw new Error('You have entered some extra details which is not allowed')
        }
        const user = new User(req.body)
        await user.save()
        const token =await user.emailToken()
        console.log(user._id)
        console.log(token)
        const t = jwt.verify(token, process.env.JWT_SECRET)
        console.log(t)
        await sendVerifyEmail({email:user.email,token,username:user.username})
        res.json({status:'passed',error:'',user})
    } catch (e) {
        if (e.message.includes('E11000 duplicate key error collection')&&e.message.includes('email'))
            return res.send({error:'Email is already Registered',status:'failed'})
        if(e.message.includes('some extra details'))
            return res.json({error:e.message,status:'failed'})
        res.send({error:'something went wrong'})
        console.log(e.message)
    }
})
//Updatin user profile details
router.patch('/user/update',userAuth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const updateAllowed = ['username','city','password','contact_no']
    const isValidUpdate = updates.every((field)=>updateAllowed.includes(field))
    if(!isValidUpdate)
        return res.send({error:'You are trying to update something which is not allowed',status:'failed'})
    try{
        const user  = await User.findById(req.user._id)
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.send({status:'passed',error:'',user})
    }catch(e){
        res.send({status:'failed',error:e.message})
    }
})

//Login 
router.post('/login',async(req,res)=>{
    console.log(req.headers)  
    console.log(req.body)  
    try{
        if(!req.body.email){
            throw new Error('Please provide an email')
        }
        if(!req.body.password)
            throw new Error('Please Provide Password')
        console.log('okay')
        const {user,error} = await User.findByCredentials(req.body.email, req.body.password)
        if (!user) {
            return res.json({
                error,
                status:'failed'
            })
        }
        const token = await user.genAuthToken()
        res.cookie("token", token, {
            sameSite: "none",
            secure: true,
            maxAge: 60 * 60 * 24 * 1,
            path: "/",
        });
    
        // res.cookie("token",token)
        res.setHeader('Authorization', 'Bearer ' + token);
        user.token= token
        user.otp=''
        await user.save()
        res.send({status:'passed',error:'',authentication:'loggedin',token,user})

    }catch(e){
        res.json({error:e.message,status:'failed'})
    }


})

//Loguot
router.post('/logout',userAuth,async(req,res)=>{
    res.clearCookie('token')
    req.user.token=''
    await req.user.save()
    res.send({status:'passed',error:'' ,authentication:'loggedout'})
})

//Checking auth
router.get('/user/me',userAuth,async(req,res)=>{

    try{
        res.send({
          user: req.user,
          authentication: req.authentication,
          status: "passed",
          error: "",
        });
    } catch(e){
        res.send({status:'failed',error:'e.message'});
    }
    
})

//geting User courses
router.get('/user/mycourses',userAuth,async(req,res)=>{
    try{
        const mycourse = req.user.courses.map(async (course) => {
            if(Date.now() > course.expiryDate){
                course.expired = true
                // await req.user.save()    
            } else{
                course.expired = false
                // await req.user.save()
            }
            const rcourse = await Course.findById(course.course)
            const x = rcourse.toObject()
            delete x.users
            if(course.expired===true){
                delete x.chapters
                x.expired = true
            } 
            return x
        })
        
        if(req.user.isModified('courses')){
            await req.user.save()
        }
    
        const registerdCourse = await Promise.all(mycourse)
        res.send({
            status: 'passed',
            error: '',
            courses: registerdCourse
        })
    }catch(e){
        res.send({error:e.message,status:'failed'})
    }
})

//email verification
router.get('/verify',async(req,res)=>{
    try{
        if(!req.query.emailToken) throw new Error('Invalid token')
        const _id = jwt.verify(req.query.emailToken, process.env.JWT_SECRET)._id;
        console.log(_id)
        const user =await User.findByIdAndUpdate(_id,{verified:true})
        if(!user) throw new Error('Invalid or expired token')
        res.send('<h2>Varified Successfully</h2>')
    }catch(e){
        res.send({error:e.message})
    }
    
})
router.post('/verify-mail',async(req,res)=>{

    try{
        if(!req.body.token) throw new Error('Invalid token')
        const _id = jwt.verify(req.body.token, process.env.JWT_SECRET)._id;
        const user =await User.findByIdAndUpdate(_id,{verified:true})
        if(!user) throw new Error('Invalid or expired token')
        res.send({status:'passed',error:''})
    }catch(e){
        res.send({error:e.message})
    }
    
})
// router.get('/delete/:id',async(req,res)=>{
//     const user = await User.findByIdAndDelete(req.params.id)
//     res.send(user)
// })
//Tests
// router.get('/tt',async(req,res)=>{
//     const t = await Usertest.find()
//     res.send(t)
// })

router.get('/user/test/my-completed-test',userAuth,async(req,res)=>{
    try{
        const myTests = req.user.completed_tests
        const allTests =await Usertest.find({
            '_id': {
                $in: req.user.completed_tests
            }
        }).limit(50)
        res.send({status:'passed',error:'',allTests})
        
    }catch(e){
        console.log(e)
    }
})

router.post('/otp-generator',async(req,res)=>{
    try {
        const emailOtp =await Math.floor(Math.random()*1000000)
        const user = await User.findOne({email:req.body.email})
        if(!user) return res.send({status:'passed'})
        user.otp=emailOtp
        await user.save()
        sendNotification({
            email: req.body.email,
            subject: 'Password reset OTP',
            message: `Your OTP for password reset is ${emailOtp} .Please do not share it with anyone.`
        })
        res.send({status:'passed'})
    } catch (e) {
        res.send({status:'failed'})
    }
})
router.post('/reset-password',async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        if(!user) throw new Error('Incorrect Otp')
        console.log(user.otp,parseInt(req.body.otp))
        if(parseInt(req.body.otp)===user.otp){
            user.opt=''
            user.password = req.body.password
            await user.save()
        } else{
            const otp = Math.floor(Math.random() * 1000000)
            user.otp = otp
            sendNotification({
                email: req.body.email,
                subject:'Password reset OTP',
                message:`Your OTP for password reset is ${otp} .Please do not share it with anyone.`
            })
            await user.save()
            throw new Error('Opt is incorrect')
        }
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})

module.exports = router
