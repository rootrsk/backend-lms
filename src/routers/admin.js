const express = require('express')
const router = new express.Router()
const userAuth = require("../middleware/userAuth");
const User = require('../database/models/user')
const Admin = require('../database/models/admin')
const Course = require('../database/models/course');
const Test = require('../database/models/test');
const adminAuth = require('../middleware/adminAuth');
const Testseries = require('../database/models/test_series');
const Coupon = require('../database/models/coupon');
const sendNotification = require('../middleware/email/notification');

//For Creating new Admin Temp. this feature is blocked
// router.post('/admin/signup', async (req, res) => {
//     try {
//         const data = Object.keys(req.body)
//         const allowedFields = ['username', 'password', 'email', 'contact_no', 'city']
//         const isValidField = data.every((field) => allowedFields.includes(field))
//         if (!isValidField) {
//             throw new Error('You have entered some extra details which is not allowed')
//         }
//         const user = new Admin(req.body)
//         await user.save()
//         res.json(user)
//     } catch (e) {
//         if (e.message.includes('E11000 duplicate key error collection') && e.message.includes('email'))
//             return res.send({
//                 error: 'Email is already Registered',
//                 status: 'failed'
//             })
//         if (e.message.includes('some extra details'))
//             return res.json({
//                 error: e.message,
//                 status: 'failed'
//             })
//         res.send({
//             error: 'something went wrong'
//         })
//         console.log(e.message)
//     }
// })

//Admin Login
router.post('/admin/login',async(req,res)=>{
    try{
        if(!req.body.email){
            throw new Error('Please provide an email')
        }
        if(!req.body.password)
            throw new Error('Please Provide Password')
        const user = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await user.genAuthToken()
        res.cookie("token", token, {
            sameSite: "none",
            secure: true,
            maxAge: 60 * 60 * 24 * 1,
            path: "/",
        });
        res.setHeader('Authorization', 'Bearer ' + token);
        user.token= token
        await user.save()
        res.send({status:'passed',error:'',authentication:'loggedin',token,user})

    }catch(e){
        res.json({error:e.message,status:'failed'})
    }
})
// Admin Update
router.patch('/update/:id',adminAuth, async (req, res) => {
    const updates = Object.keys(req.body)
    const updateAllowed = ['username', 'city', 'password', 'contact_no']
    const isValidUpdate = updates.every((field) => updateAllowed.includes(field))
    if (!isValidUpdate)
        return res.send({
            error: 'You are trying to update something which is not allowed',
            status: 'failed'
        })
    try {
        const user = await Admin.findById(req.params.id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.send(e.message)
    }
})

//Adding a courese to user (Manually)
router.get('/admin/adduser/:course_id/:user_id',adminAuth,async(req,res)=>{
    try{
        const user = await User.findById(req.params.user_id)
        const course = await Course.findById(req.params.course_id)
        if(!user) throw new Error('We could not found you in our database')
        if(!course) throw new Error('This course is not avallable')
        const isCourseRegistered = user.courses.filter((item)=>{
            if(item.course=== course._id.toString()) return true 
        }).length>0
        if(isCourseRegistered){
            throw new Error('You are already registerd')
        }
        user.courses = user.courses.concat({
            course:course._id,
            created:Date.now(),
            expiryDate: Date.now() + 31540000000,
            expired: false
        })
        await user.save()

        const isUserRegistered = course.users.map((id)=>{
            return id.toString() === course._id.toString()
        }).length>0
        if(isUserRegistered){
            throw new Error('You are already registered')
        }
        course.users = course.users.concat(user._id)
        await course.save() 
        res.send({status:'passed',error:''})       
    }catch(e){
        console.log(e)
        res.send({error:e.message,status:'failed'})
    }
})


//Logout 
router.post('/logout', (req, res) => {
    try{
        res.clearCookie('token')
        res.send({
            status: 'passed',
            error: '',
            authentication: 'loggedout'
        })
    }catch(e){
        res.send({status:'failed',error:e.message})
    }

})
//Admin Auth Checking 
router.post('/admin/me', adminAuth, async (req, res) => {
    try {
        res.send({
            user: req.user,
            authentication: req.authentication,
            status: "passed",
            error: "",
        });
    } catch (e) {
        res.send({
            status: 'failed',
            error: 'e.message'
        });
    }

})

router.get('/admin/users',adminAuth ,async(req,res)=>{

    try {
        const users =await User.find({}).sort({_id:-1}).limit(10).skip(parseInt(req.query.skip))
        res.send({status:'passed',users})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//For deleting a user from registerd course
router.delete('/admin/adduser/:course_id/:user_id',adminAuth,async(req,res)=>{
    try{
        const user = await User.findById(req.params.user_id)
        const course = await Course.findById(req.params.course_id)
        if(!user) throw new Error('We could not found you in our database.')
        if(!course) throw new Error('This course is not avallable.')
        user.courses = user.courses.filter((item)=>{
            return item.course.toString() !== course._id.toString()
        })
        course.users=course.users.filter((id)=>{
            return id.toString() !==user._id.toString()
        })
        await user.save()
        await course.save() 
        res.send({status:'passed',error:'',user,course})       
    }catch(e){
        console.log(e.message)
        res.send({error:e.message,status:'failed'})
    }
})
router.get('/deleteuser/:id',adminAuth,async(req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id.toString())
        res.send('deleted')
    }catch(e){  
        res.send({error:e.message})
    }
    
})
//Creating otp for password reset
router.post('/otp-generator-admin',async(req,res)=>{
    try {
        const emailOtp =await Math.floor(Math.random()*10000000000)
        const user = await Admin.findOne({email:req.body.email})
        if(!user) return res.send({status:'failed',error:'Email is not registered.'})
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
//Changing Password 
router.post('/reset-password-admin',async(req,res)=>{
    try {
        const user = await Admin.findOne({email:req.body.email})
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


router.post('/admin/user-remove',adminAuth,async(req,res)=>{
    try {
        if(!req.body.email) throw new Error('No data found')
        const user =await User.findOneAndRemove({email:req.body.email})
        if(!user) throw new Error('User does not found.')
        res.send({status:'passed',error:''})
    } catch (e) {
        console.log(e)
        res.send({error:e.message,status:'failed'})
    }
})
router.post('/admin/get-user',adminAuth,async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        console.log(user)
        res.send({status:'passed',data:[user]})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/admin/course/remove',adminAuth,async(req,res)=>{
    try {
        
        const user  = await User.findOne({email:req.body.email})
        const course = await Course.findOne({_id:req.body.course_id})
        if(!user) throw new Error('User not found.')
        if(!course) throw new Error('Course not found.')
        user.courses = user.courses.filter((course)=>{
            return course.course !== req.body.course_id
        })
        console.log(user)
        await user.save()
        course.users.pull(user._id)
        await course.save()
        res.send({status:'passed'})
    } catch (e) {
        console.log(e)
        res.send({status:'failed'})
    }
})
router.post('/admin/course/add',adminAuth,async(req,res)=>{
    try {
        console.log(req.body)
        const user  = await User.findOne({email:req.body.email})
        const course = await Course.findOne({_id:req.body.course_id})
        if(!user) throw new Error('User not found.')
        if(!course) throw new Error('Course not found.')
        const isCourseReg = user.courses.map((course)=>course.course===course._id).length>0
        const isUserReg = course.users.indexOf(user._id) > -1
        if(isCourseReg && isUserReg) throw new Error('User is Already regitered.')
        if(!isCourseReg){
        user.courses = user.courses.concat({
                course: course._id,
                created: Date.now(),
                expiryDate: Date.now() + 31540000000,
                expired: false
            })
            await user.save()
        }
        if(!isUserReg){
            course.users = course.users.concat(user._id)
            await course.save()
        }
        res.send({status:'passed'})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
})

router.post('/admin/series/add',adminAuth, async (req, res) => {
    try {
        const user  = await User.findOne({email:req.body.email})
        const series = await Testseries.findOne({_id:req.body.test_id})
        if(!user) throw new Error('User not found.')
        if(!series) throw new Error('Test Series not found.')
        const isUserReg = series.users.indexOf(user._id) >-1
        const isTestReg = user.test_series.indexOf(series._id) > -1
        if(isUserReg&&isTestReg) throw new Error('User is Already Registerd to This TestSeries')
        if(!isUserReg){
            series.users.push(user.id)
            await series.save()
        }
        if(!isTestReg){
            user.test_series.push(series._id)
            await user.save()
        }
        res.send({status:'passed'})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/admin/series/remove',adminAuth, async (req, res) => {
    try {
        const user  = await User.findOne({email:req.body.email})
        const series = await Testseries.findOne({_id:req.body.test_id})
        if(!user) throw new Error('User not found.')
        if(!series) throw new Error('Test Series not found.')
        const isUserReg = series.users.indexOf(user._id) >-1
        const isTestReg = user.test_series.indexOf(series._id) > -1
        if(!isUserReg&&!isTestReg) throw new Error('User is Not Registerd to TestSeries')
        if(isUserReg){
            series.users.pull(user.id)
            await series.save()
        }
        if(isTestReg){
            user.test_series.pull(series._id)
            await user.save()
        }
        res.send({status:'passed'})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.get('/discount-codes',async(req,res)=>{
    const discount_codes = await Coupon.find({})
    res.send({status:'passed',discount_codes})
})

router.post('/admin/discount_code',adminAuth, async(req,res)=>{
    try {
        if(req.body.operation==='create'){
            const discount_code = new Coupon(req.body.data)
            await discount_code.save()
            return res.send({status:'passed'})
        }
        if(req.body.operation==='update'){
            const discount_code = await Coupon.findByIdAndUpdate(req.body.id,req.body.data)
            return res.send({status:'passed'})
        }
        if(req.body.operation==='delete'){
            const discount_code = await Coupon.findByIdAndRemove(req.body.id)
            return res.send({status:'passed'})
        }
        throw new Error('Unauthorized Operation')
        
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})



// router.post('/otp-generator-admin',async(req,res)=>{
//     console.log(req.body)
//     try {
//         const emailOtp =await Math.floor(Math.random()*100000000)
//         const admin = await Admin.findOne({email:req.body.email})
//         if(!admin) return res.send({status:'passed'})
//         admin.otp=emailOtp
//         await admin.save()
//         sendNotification({
//             email: req.body.email,
//             subject: 'Password reset OTP',
//             message: `Your OTP for password reset is ${emailOtp} .Please do not share it with anyone.`
//         })
//         res.send({status:'passed'})
//     } catch (e) {
//         res.send({status:'failed'})
//     }
// })
// router.post('/reset-password-admin',async(req,res)=>{
//     try {
//         const admin = await Admin.findOne({email:req.body.email})
//         if(!admin) throw new Error('Incorrect Otp')
//         console.log(admin.otp,parseInt(req.body.otp))
//         if(parseInt(req.body.otp)===admin.otp){
//             admin.opt=''
//             admin.password = req.body.password
//             await admin.save()
//         } else{
//             const otp = Math.floor(Math.random() * 1000000)
//             admin.otp = otp
//             sendNotification({
//                 email: req.body.email,
//                 subject:'Password reset OTP',
//                 message:`Your OTP for password reset is ${otp} .Please do not share it with anyone.`
//             })
//             await admin.save()
//             throw new Error('Opt is incorrect')
//         }
//         res.send({status:'passed',error:''})
//     } catch (e) {
//         res.send({status:'failed',error:e.message})
//     }
// })
router.post('/users',adminAuth,async(req,res)=>{
    try{
        const users = await User.find().sort({_id:-1}).skip(req.body.skip).limit(20)
        res.send({status:'passed',users})
    }catch(e){
        res.send({status:'failed',error:'Somethng went wrong.'})
    }
})
module.exports = router