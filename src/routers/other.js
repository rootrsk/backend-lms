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



module.exports = router