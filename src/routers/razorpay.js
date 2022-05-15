const Razorpay = require('razorpay')
const express = require('express')
const Course = require('../database/models/course')
const User = require('../database/models/user')
const userAuth = require('../middleware/userAuth')
const couresMail = require('../middleware/email/CourseReg')
const sendVerifyEmail = require('../middleware/email/emailVerification')
const { v4: uuid } = require("uuid");
const Testseries = require('../database/models/test_series')
const Coupon = require('../database/models/coupon')
const router = new express.Router()
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});



//Getting Order detail 
router.post('/validate/course-discount_code',async(req,res)=>{
    try {
        if(!req.body.discount_code){
            throw new Error('Invalid Discount Code.')
        }
        const discount_code = await Coupon.findOne({discount_code:req.body.discount_code})
        if(!req.body.course_id) throw new Error('This Course Does not Exit.')
        const course = await Course.findById(req.body.course_id)
        if(!course) throw new Error('No Such Course found.')
        if(!discount_code) throw new Error('Invalid Discount Code.')
        const data = {
            course_name:course.course_name,
            course_id:course._id,
            discount_code:req.body.discount_code,
            discount_percentage:discount_code.discount_percentage,
            price:course.price,
            discount:(course.price/100)*discount_code.discount_percentage,
            final_price:course.price-(course.price/100)*discount_code.discount_percentage,
            product_type:'Course'
        }
        res.send({status:'passed',error:'',data})
        
    } catch (e) {
        res.send({
            status:'failed',
            error:e.message
        })
    }
})
router.post('/order-course',userAuth,async(req,res)=>{
    
    try{
        if(!req.body.course_id) throw new Error('This is Not A Valid course.')
        const course = await Course.findOne({_id:req.body.course_id});
        if(!course) throw new Error('This course does not exist.')
        req.user.courses.map((course)=>{
            if(course.course===req.body.course_id) {
                // return res.send({status:'failed',error:'You are already registerd to this course'})
                throw new Error('You are already registered to this couse')
            }
        })
        if(!req.user) return res.send('login to continue')
        if (!req.user.verified) {
            const token = await req.user.emailToken();
            await sendVerifyEmail({email:req.user.email,token,username:req.user.username});
            throw new Error('Please check your email and verify');
        }
        let price 
        if(req.body.discount_code){
            const discount_code = await Coupon.findOne({discount_code:req.body.discount_code})
            if(discount_code){
                price = course.price - (course.price/100)*discount_code.discount_percentage
            }else{
                price = course.price
            }
        }else {
            price = course.price
        }
        const options ={
            amount: price*100,
            currency: 'INR',
            payment_capture: 1,
            notes:{"user_id":req.user._id.toString(),"course_id":course._id.toString(),'type':'course'},
            receipt: uuid()
        }
        const courseDetails = {
            course_id:course._id,
            course_name:course.course_name
        }
        const order = await razorpay.orders.create(options)
        
        res.send({error:'',status:'passed',order,user:req.user,course:courseDetails})
    }catch(e){
        res.send({error:e.message,status:'failed'})
    }
    
})
router.post('/order-series', userAuth, async (req, res) => {
    console.log(req.body)
    try {
        const course = await Testseries.findOne({
            _id: req.body.course_id
        });
        if (!course) throw new Error('This course does not exist.')
        const isUserRegistered = await req.user.test_series.indexOf(course._id.toString())> -1
        if(isUserRegistered) throw new Error('You are Already Registed to this Series.')
        if (!req.user) return res.send('login to continue')
        if (!req.user.verified) {
            const token = await req.user.emailToken();
            await sendVerifyEmail({
                email: req.user.email,
                token,
                username: req.user.username
            });
            throw new Error('Please check your email and verify');
        }
        const options = {
            amount: course.price * 100,
            currency: 'INR',
            payment_capture: 1,
            notes: {
                "user_id": req.user._id.toString(),
                "course_id": course._id.toString(),
                "type" : 'test_series'
            },
            receipt: uuid()
        }
        const courseDetails = {
            course_id: course._id,
            course_name: course.title
        }
        const order = await razorpay.orders.create(options)
        res.send({
            error: '',
            status: 'passed',
            order,
            user: req.user,
            course: courseDetails
        })
    } catch (e) {
        console.log('Error')
        res.send({
            error: e.message,
            status: 'failed'
        })
    
    }

})



//Payment confirmation from razorpay
router.post('/verification',async(req,res)=>{
    const signature = req.headers["x-razorpay-signature"]
    if(!signature) return res.status(200).send('Signature does not exist')
    const isValidSignature = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature, process.env.RAZORPAY_WEBHOOK_SECRET)
    console.log('p')
    if (isValidSignature) {
        const user = await User.findById(req.body.payload.payment.entity.notes.user_id)
        if (req.body.payload.payment.entity.notes.type === 'test_series') {
        
            const series = await Testseries.findById(req.body.payload.payment.entity.notes.course_id)
            console.log(req.body.payload.payment.entity.notes.course_id)
            if (!user) couresMail({email: 'cadrewill.edu@gmail.com',course: `Error : User not found in database has ordered a course`})
            if (!series) couresMail({email: 'cadrewill.edu@gmail.com',course: `Error : Payment has done to a non existing course`})
            const isSeriesRegisterd = user.test_series.indexOf(series._id.toString())> -1
            const isUserRegistered = series.users.indexOf(user._id.toString()) > -1
            
            if(!isSeriesRegisterd){
                user.test_series = user.test_series.concat(series._id)
                await user.save()
            }
            if(!isUserRegistered){
                series.users = series.users.concat(user._id)
                await series.save()
            }
            couresMail({
                email: user.email,
                course: series.title
            })
            couresMail({
                email: 'cadrewill.edu@gmail.com',
                course: `TestSeries:${series._id} ${series.title} user:${user.email}`
            })


        } else{
            console.log('Buying Course')
            course = await Course.findById(req.body.payload.payment.entity.notes.course_id)
            if (!user) couresMail({email: 'cadrewill.edu@gmail.com',course: `Error : User not found in database has ordered a course`})
            if (!course) couresMail({email: 'cadrewill.edu@gmail.com',course: `Error : Payment has done to a non existing course`})

            const isCourseRegistered = user.courses.filter((item) => item.course.toString()===course._id.toString()).length > 0
            const isUserRegistered = course.users.indexOf(user._id.toString()) > -1
            console.log(isCourseRegistered,isUserRegistered)
            if (!isCourseRegistered) {
                user.courses = user.courses.concat({
                    course: course._id,
                    created: Date.now(),
                    expiryDate: Date.now() + 31540000000,
                    expired: false
                })
                console.log(user.courses)
                await user.save()
            }
           
            if (!isUserRegistered) {
                course.users = course.users.concat(user._id)
                await course.save()
                console.log(course.users)
            } 
            couresMail({
                email: user.email,
                course: course.course_name
            })
            couresMail({
                email: 'cadrewill.edu@gmail.com',
                course: `course:${course.course_name} user:${user.email}`
            })

        } 
    }
    res.status(200)
    res.json('ok')
})


module.exports = router