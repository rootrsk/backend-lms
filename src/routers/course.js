const express = require('express')
const userAuth = require('../middleware/userAuth')
const Course = require('../database/models/course')
const Test = require('../database/models/test')
const User = require('../database/models/user')
const Usertest = require('../database/models/userTest')
const Testseries = require('../database/models/test_series')
const Notification = require('../database/models/notification')
const sendNotification = require('../middleware/email/notification')
const Slider = require('../database/models/slider')
const Dailynews = require('../database/models/dailynews')
const Interview = require('../database/models/interview')
const adminAuth = require('../middleware/adminAuth')

const router = new express.Router()

//Slider CRUD
router.get('/slider',async(req,res)=>{
    try {
        const slides = await Slider.find()
        res.send({status:'passed',error:'',slides})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})

router.post('/slider-create',adminAuth, async(req,res)=>{
    try {
        if(!req.body) throw new Error('No Data Found')
        const slide = new Slider(req.body)
        await slide.save()
        res.send({status:'passed',error:''})    
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/slider-update',adminAuth,async(req,res)=>{
    try {
        if(!req.body.id) throw new Error('No Data Found')
        const slide = await Slider.findByIdAndUpdate(req.body.id,req.body)
        res.send({status:'passed',error:''})    
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/slider-delete',adminAuth,async(req,res)=>{
    try {
        if(!req.body.id) throw new Error('No Data Found')
        const slide = await Slider.findByIdAndRemove(req.body.id)
        res.send({status:'passed',error:'',slide})
    }catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//Dailynews or CurrentAffairs Crud 
router.get('/admin/daily-knowledge',adminAuth,async(req,res)=>{
    try {
        const dailynews = await Dailynews.find().sort({_id:-1})
        res.send({status:'passed',dailynews})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//for User Displaying 
router.get('/daily-knowledge',async(req,res)=>{
    try {
        const dailynews = await Dailynews.find().sort({_id:-1}).limit(30)
        res.send({status:'passed',dailynews})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/daily-knowledge-create',adminAuth,async(req,res)=>{
    try {
        const dailynews = new Dailynews(req.body)
        await dailynews.save()
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/daily-knowledge-update',adminAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('Data not Found')
        const dailynews = await Dailynews.findByIdAndUpdate(req.body.id,req.body)
        res.send({status:'passed',})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/daily-knowledge-delete',adminAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('Data not Found')
        const dailynews = await Dailynews.findByIdAndDelete(req.body.id)
        res.send({status:'passed',})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//Creata InterView Form
router.post('/interview-form',async(req,res)=>{
    try {
        console.log(req.body)
        const interview = new Interview(req.body)
        await interview.save()
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({error:e.message,status:'failed'})
    }
})
router.get('/interview',async(req,res)=>{
    try {
        const interviews = await Interview.find({})
        res.send({status:'passed',error:'',interviews})
    } catch (e) {
        res.send({error:e.message,status:'failed'})
    }
})
router.post('/interview-delete',async(req,res)=>{
    try {
        console.log(req.body)
        if(!req.body.id) throw new Error('No data found')
        const interiew = await Interview.findByIdAndRemove(req.body.id)
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({error:e.message,status:'failed'})
    }
})

//Create  New Course 
router.post('/create-course',adminAuth,async(req,res)=>{
    try {
        const course = new Course(req.body)
        await course.save()
        res.send({
            status: 'passed',
            error: ''
        })
    } catch (e) {
        res.send({
            status: 'failed',
            error: e.message
        })
    }
    
})
//Delete Course 
router.delete('/delete-course/:id',adminAuth,async(req,res)=>{
    try{
        const course = await Course.findByIdAndRemove(req.params.id)
        const courses = await Course.find({})
        res.send({status:'passed',error:'',courses})
    }catch(e){
        res.send({status:'failed',error:e.message})
    }
})

//Get Courses for type 1

router.get('/courses-home',async(req,res)=>{
    console.log(req.query)
    const courses = await Course.find({published:true,type:1}).sort({_id:-1}).skip(parseInt(req.query.skip)).limit(15)
    const scourse = await courses.map((course)=>{
        const UserCourse = {
            _id:course._id,
            poster:course.poster,
            course_name:course.course_name,
            price:course.price,
            teacher_name:course.teacher_name,
            description : course.description
        }
        return UserCourse
    })
    console.log(scourse)
    res.send({status:'passed',error:'',courses:scourse})
})
//Get Courses for type 2
router.get('/courses-home-civil',async(req,res)=>{
    const courses = await Course.find({type:2,published:true}).sort({_id:-1}).skip(parseInt(req.query.skip)).limit(15)
    const scourse = await courses.map((course)=>{
        const UserCourse = {
            _id:course._id,
            poster:course.poster,
            course_name:course.course_name,
            price:course.price,
            teacher_name:course.teacher_name,
            description : course.description
        }
        return UserCourse
    })
    res.send({status:'passed',error:'',courses:scourse})
})

//Get Course Details for admin
router.get('/courses-admin',adminAuth,async(req,res)=>{
    const courses = await Course.find({})
    res.send({status:'passed',error:'',courses})    
})
// For creating new Chaptet to a site using Course ide
router.post('/create-chapter/:course_id',adminAuth,async(req,res)=>{
    const course = await Course.findById(req.params.course_id)
    const chapter = {...req.body}
    course.chapters = course.chapters.concat(chapter)
    chapter.save()
    res.send(course)

})
//GEt all courses  for checking purpose 
// router.get('/courses',async(req,res)=>{
//     try{
//         const courses = await Course.find({})
//         console.log(courses)
//         res.json({error:'',status:'passed',courses})

//     }catch(e){
//         res.send({error:e.message,status:'failed'})
//     }
// })

//Get Course from id admin
router.get('/course/:id',adminAuth,async(req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        res.send({
            status: 'passed',
            error: '',
            course
        })
    } catch (e) {
        res.send({
            status: 'failed',
            error: e.message,
        })
    }
    
})
//update Course from  id
router.patch('/course/:id',adminAuth,async(req,res)=>{
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body)
        const updatedCourse = await Course.findById(req.params.id)
        res.send({
            status: 'passed',
            error: '',
            course: updatedCourse
        })
    } catch (e) {
        res.send({
            status: 'failed',
            error: e.message,
        })
    }
    
})
//Create new Chapter
router.post('/course/chapter/:id',adminAuth,async(req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        course.chapters = course.chapters.concat(req.body)
        await course.save()
        res.send({
            status: 'passed',
            error: '',
            course
        })
    } catch (e) {
        res.send({
            status: 'failed',
            error: e.message,
        })
    }
    
})
//Deleter Chpater 
router.delete('/course/chapter',adminAuth,async(req,res)=>{
    try {
        console.log(req.body)
        const course = await Course.findOne({
            'chapters._id': req.body.id
        })
        course.chapters.pull({
            _id: req.body.id
        })
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {
        
    }
})

// Create new Video in form lession id of Courese
router.post('/course/chapter/video/:id',adminAuth,async(req,res)=>{
    const course = await Course.findOne({'chapters._id':req.params.id.toString()})
    course.chapters =  course.chapters.map((chapter)=>{
        if(chapter._id.toString()===req.params.id.toString()){
            chapter.videos = chapter.videos.concat(req.body)
            return chapter
        } else{
            return chapter
        }
    })
    await course.save()
    res.send({status:'passed',error:'', course})
})

//update chapter
router.patch('/course/chapter/:course_id/:chapter_id',adminAuth,async(req,res)=>{

    try {
        const course_id = req.params.course_id
        const chapter_id = req.params.chapter_id
        console.log(req.body)
        console.log(chapter_id)
        const update = {
            title: req.body.title,
            description: req.body.description
        }
        const chapter = await Course.updateOne({
            'chapters._id': chapter_id
        }, {
            '$set': {
                'chapters.$': req.body
            }
        })
        console.log(chapter)
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:''})
    }
})
//update video details
router.patch('/video/:id',adminAuth,async(req,res)=>{
    try{
        const videos = await Course.findOne({'chapters.videos._id':req.params.id})
        const x = await videos.chapters.map(async (chapter) => {
        await chapter.videos.map(async(video)=>{
                if(video._id.toString()===req.params.id.toString()){
                    video.title=req.body.title
                    video.description=req.body.description
                    video.link=req.body.link
                    await videos.save()
                } 
            })
        })
        await Promise.all(x)
        res.send({message:'passed',error:'',course:videos})
    }catch(e){
        res.send({message:'failed',error:e.message})
    }
    
})
//Delete Video
router.delete('/video/:id',adminAuth,async(req,res)=>{
    try{
        const course = await Course.findOne({'chapters.videos._id':req.params.id})
        const chapters = await course.chapters.map((chapter) => {
            const videos =  chapter.videos.filter((video)=>{
                if (video._id.toString() !== req.params.id.toString())console.log(video)
                return video._id.toString() !== req.params.id.toString()
            })
            chapter.videos =videos
            return chapter
        })
        await Promise.all(chapters)
        console.log(chapters)
        course.chapters =chapters
        const y = await Promise.all(chapters)
        res.send({message:'passed',error:'',course})
    }catch(e){
        console.log(e.message)
        res.send({message:'failed',error:e.message})
        
    }
    
})
//Study Material Create
router.post('/course/material',adminAuth,async(req,res)=>{
    try {
        const course = await Course.findById(req.body.course_id)
        course.study_material = course.study_material.concat(req.body)
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//Study Material update
router.post('/course/material/update',adminAuth,async(req,res)=>{ 
    console.log(req.body)
    try {
        const course =await Course.updateOne({'study_material._id':req.body.id},{
            '$set':{
                'study_material.$': req.body
            }
        })
        res.send({status:'passed',error:'',course})
    } catch (e) {
        console.log(e)
    }
})
//Study Material Delete
router.post('/course/material/delete',adminAuth,async(req,res)=>{
    try {
        const course = await Course.findOne({'study_material._id':req.body.id})
        course.study_material.pull({_id:req.body.id})
        await course.save()
        console.log(course)
        res.send({status:'passed',error:'',course})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
})
//Get Course Buy Details for Users
router.get('/course/course-veiw/:id',async(req,res)=>{

    try{
        const course = await Course.findById(req.params.id)
        if(!course) throw new Error('Course not found.')
        const courseInfo = course.toObject()
        delete courseInfo.chapters
        const chapters = course.chapters.map((chapter)=>{
            const topic = chapter.videos.map((video)=>{
                return {title:video.title}
            })
            return{
                chapter_title : chapter.title,
                topic
            }
        })
        res.send({error:'',status:'passed',...courseInfo,chapters})
    }catch(e){
        res.send({error:e.message,status:'failed'})
    }
})
//create Practice Set
router.post('/course/practice-create',adminAuth, async (req, res) => {
    try {
        if(!req.body)throw new Error('Data Not Found')
        console.log(req.body)
        const course =await Course.findById(req.body.id)
        if(!course) throw new Error("No Such Course Found")
        course.practice_set = course.practice_set.concat(req.body)
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
})
router.post('/course/practice-update',adminAuth, async (req, res) => {
    try {
        
        if(!req.body)throw new Error('Data Not Found')
        const course =await Course.updateOne({'practice_set._id':req.body.id},{
            '$set':{
                'practice_set.$': req.body
            }
        })
        res.send({status:'passed',error:''})
    } catch (e) {

    }
})
router.post('/course/practice-delete',adminAuth, async (req, res) => {
    try {
        const course = await Course.findOne({'practice_set._id':req.body.id})
        course.practice_set.pull({_id:req.body.id})
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {

    }
})
router.post('/course/preview-create',adminAuth, async (req, res) => {
    try {
        if(!req.body)throw new Error('Data Not Found')
        console.log(req.body)
        const course =await Course.findById(req.body.id)
        if(!course) throw new Error("No Such Course Found")
        course.preview_videos = course.preview_videos.concat(req.body)
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
})
router.post('/course/preview-update',adminAuth, async (req, res) => {
    try {
        
        if(!req.body)throw new Error('Data Not Found')
        const course =await Course.updateOne({'preview_videos._id':req.body.id},{
            '$set':{
                'preview_videos.$': req.body
            }
        })
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/course/preview-delete',adminAuth, async (req, res) => {
    try {
        const course = await Course.findOne({'preview_videos._id':req.body.id})
        course.practice_set.pull({_id:req.body.id})
        await course.save()
        res.send({status:'passed',error:'',course})
    } catch (e) {

    }
})

//Admin Dashboard details
router.get('/admin/dashboard',adminAuth,async(req,res)=>{
    const courses = await Course.find({})
    const tests = await Test.countDocuments()
    const submitedTests = await Usertest.countDocuments()
    const testSeries = await Testseries.countDocuments()
    // const testSeries = await Testseries.countDocuments()
    const scourses = courses.map((course)=>{
        return{
            course_name:course.course_name,
            users:course.users.length
        }
    })
    await Promise.all(scourses)
    const users = await User.countDocuments()
    res.send({message:'passed',error:'',details:{users,scourses,courses:courses.length,tests,submitedTests,testSeries}})
})
router.post('/admin/mains-update',adminAuth,async(req,res)=>{
    try {
        if(!req.body.id) throw new Error('Data not Found')
        const usertest = await Usertest.findByIdAndUpdate(req.body.id,req.body)
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})

router.post('/submit/test-mains',userAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('We did not got any data from You')
        if(!req.body.doc_answer) throw new Error('We did not got your answer link')
        const test = await Test.findById(req.body.id)
        const isSubmitted = test.users.filter((x)=>x.id===req.user._id.toString()).length>0
        const isCompleted = req.user.completed.includes(test.id)
        console.log(isCompleted)
        if(!isSubmitted){
            test.users = test.users.concat({id:req.user._id,marks:''})
            sendNotification({
                email:'cadrewill.edu@gmail.com',
                subject:'New Mains Answer Submission.',
                message:`User${req.user.username} email : ${req.user.email}has just submitted  a new answer to Test ${test.title} having test id : ${test._id}`,
            })
            await test.save()
        }
        
        const uTest = test.toObject()
        delete uTest._id
        const tests = new Usertest(uTest)
        tests.doc_answer = req.body.doc_answer
        tests.test_id=test._id
        if(!isCompleted){
            req.user.completed_tests = req.user.completed_tests.concat(tests._id)
            req.user.completed = req.user.completed.concat(test._id)
            await req.user.save()
            await tests.save()
        }
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})

//Tests On Submit
router.post('/submit/test',userAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('We did not receive any data from you.')
        console.log(req.body)
        const test = await Test.findById(req.body.id)
        if(!test) throw new Error('This Test does not exist.')
        let correctAnswers = 0
        let wrongAnswers = 0
        let attempedQuestion = 0
        const y = await test.questions.map((question, index) => {
            if (req.body.answers[index].answer) {
                if (question.correct_option.toString() === req.body.answers[index].answer) {
                    correctAnswers++
                    attempedQuestion++
                } else {
                    wrongAnswers++
                    attempedQuestion++
                }
            }
        })
        
        await Promise.all(y)

        //Saving User Marks in test
        const isReg = test.users.filter((x)=>x.id===req.user._id.toString()).length>0
        if(!isReg){
            console.log('usernotRegistered')
            test.users = test.users.concat({id:req.user._id,marks:correctAnswers})
            test.users = test.users.sort(compare)
            await test.save()
        }
        function compare(a, b) {
            if (a.marks < b.marks)  return 1;
            if (a.marks < b.marks) return -1;
            return 0;
        }
        const isLargeNumber = (element) => element.marks <= correctAnswers;
        let myRank = test.users.findIndex(isLargeNumber)+1
        const totalRank = test.users.length+1
        if(myRank<=0) myRank=totalRank
        const uTest = test.toObject()
        delete uTest._id
        const tests = new Usertest(uTest)
        tests.checked = true
        tests.answers = req.body.answers
        tests.test_id = test._id
        tests.correctAnswers = correctAnswers
        tests.wrongAnswers = wrongAnswers
        tests.attemped = attempedQuestion
        tests.accuracy = (correctAnswers / attempedQuestion) * 100
        tests.timeTaken = test.time_limit- req.body.r_time
        if (tests.positive_marks && test.negative_marks) {
            tests.marks = (correctAnswers*tests.positive_marks)-(wrongAnswers*tests.negative_marks)
            tests.totalMarks = test.questions.length * tests.positive_marks
        } else{
            tests.marks = (correctAnswers * tests.positive_marks) - (wrongAnswers * tests.negative_marks)
            tests.totalMarks = test.questions.length * tests.positive_marks
        }
        
        const isCompleted = req.user.completed.includes(test.id)
        console.log('com;eted',isCompleted)
        if(!isCompleted) {
            req.user.completed_tests = req.user.completed_tests.concat(tests._id)
            req.user.completed = req.user.completed.concat(test._id)
            await req.user.save()
            await tests.save()
        }
        console.log(tests)
        tests.myRank = myRank
        tests.totalRank = totalRank
        res.send({
            status: 'passed',
            error: '',
            result:tests,
            totalRank,
            myRank
        })
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
    
})
router.post('/course/test',adminAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('Data not found')
        const test = new Test(req.body)
        await test.save()
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.post('/course/test-update',adminAuth,async(req,res)=>{
    try {
        
        if(!req.body.id) throw new Error('Data not found')
        const test =await Test.findByIdAndUpdate(req.body.id.toString(),req.body)
        res.send({status:'passed',error:''})
    } catch (e) {
        console.log()
        res.send({status:'failed',error:e.message})
    }
    
})
router.post('/course/test-delete',adminAuth,async(req,res)=>{
    try {
        
        if(!req.body.id) throw new Error('Data not found')
        const test =await Test.findByIdAndRemove(req.body.id.toString())
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
    
})
router.get('/admin/tests',adminAuth,async(req,res)=>{
    try {
        const tests =await Test.find({}).sort({'_id':-1}).skip(parseInt(req.query.skip)).limit(20)
        res.send({status:'passed',error:'',tests})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.get('/admin/test-mains',adminAuth,async(req,res)=>{
    try {
        const tests =await Usertest.find({checked:false}).sort({'_id':-1}).limit(20)
        res.send({status:'passed',error:'',tests})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
//TestSeries Router
router.get('/user/series',userAuth,async(req,res)=>{
    try {
        const testSeries = await User.findById(req.user._id).populate('test_series').exec()
        res.send({status:'passed',error:'',testSeries:testSeries.test_series})
    } catch (e) {
        res.send({status:'passed',error:e.message})
    }
})
router.get('/user/completed-tests',userAuth,async(req,res)=>{
    try {
        const tests = await User.findById(req.user._id).populate('completed_tests').exec()
    res.send({status:'passed',error:'',tests:tests.completed_tests})
    } catch (e) {
        
    }
})
router.post('/user/mytests',userAuth,async(req,res)=>{
    try {
        if(!req.body.id)throw new Error('Id Not Provieded')
        const series = await Testseries.findOne({
            _id: req.body.id
        }).populate('tests', 'title category sub_category langauge time_limit type questions_no').exec()
        const tests =await series.tests
        res.send({status:'passed',errro:'',tests})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
        
    }
})
router.post('/user/free-tests', async (req, res) => {
    try {
        const tests = await Test.find({paid:false})
        console.log(tests)
        res.send({status:'passed',errro:'',tests})
    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
        
    }
})
router.get('/test/series',async(req,res)=>{
    try {
        const series = await Testseries.find().sort({'_id':-1}).skip(parseInt(req.query.skip)).limit(10)
        res.send({status:'passed',error:'',series})
    } catch (e) {
        console.log(e)
    }
})
router.post('/test/series',adminAuth,async(req,res)=>{
    try {
        const series = new Testseries(req.body)
        console.log(series)
        await series.save()
        res.send({status:'passed',series})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }   
})
router.patch('/test/series',adminAuth,async(req,res)=>{
    try {
        const testSeries = await Testseries.findByIdAndUpdate(req.body.id,req.body)
        res.send({status:'passed',error:''})
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.delete('/test/series',adminAuth, async (req, res) => {
    try {
        await Testseries.findByIdAndRemove(req.body.id)
        res.send({status:'passed',error:''})

    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.get('/test',async(req,res)=>{
    const tests = await Usertest.find({})
    res.send(tests)
}) 
router.post('/test/:id',async(req,res)=>{
    try {
        const test = await Test.findById(req.params.id)
        res.send(test)
    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
    
})

//Notification Routes
router.get('/get-notification',async(req,res)=>{
    try {
        const notifications = await Notification.find({}).sort({'_id':-1}).skip(parseInt(req.query.skip)).limit(30)
        res.send({status:'passed',error:'',notifications})

    } catch (e) {
        console.log(e)
        res.send({status:'failed',error:e.message})
    }
})
router.post('/admin/create-notification',adminAuth,async(req,res)=>{
    try {
        if(!req.body) throw new Error('Data not Found')
        const notification = new Notification(req.body)
        await notification.save()
        res.send({status:'passed',error:'',notification})

    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.patch('/admin/update-notification',adminAuth,async(req,res)=>{
    try {
        console.log(req.body)
        if(!req.body.id) throw new Error('Id not Found')
        const notification = await Notification.findOneAndUpdate({_id:req.body.id},req.body)
        await notification.save()
        res.send({status:'passed',error:'',notification})

    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
router.delete('/admin/delete-notification',adminAuth,async(req,res)=>{
    try {
        if(!req.body.id) throw new Error('Id not Found')
        const notification = await Notification.findOneAndRemove({_id:req.body.id})
        res.send({status:'passed',error:'',notification})

    } catch (e) {
        res.send({status:'failed',error:e.message})
    }
})
module.exports = router