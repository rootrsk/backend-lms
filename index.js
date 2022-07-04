const express = require('express')
const cors = require('cors')
require("dotenv").config();
require('./src/database/mongoose')
const bodyParser = require('body-parser')
const userRouter = require('./src/routers/user')
const adminRouter = require('./src/routers/admin')
const CourseRouter = require('./src/routers/course')
const paymentRouter = require('./src/routers/razorpay')
const cookieParser = require('cookie-parser')
const app  = express() 
// app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: '*'
}))
// app.use(cors());
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     const allowedOrigins = [
//       "https://rootrsk.github.io",
//       "http://localhost:3000",
//       'https://lms-react-34dc0.web.app',
//       'https://cadrewill.web.app',
//       'https://cadrewill.com',
//       'https://cadrewill.com',
//       'https://www.cadrewill.com'

//     ];
//     const origin = req.headers.origin;
//     if (allowedOrigins.indexOf(origin) > -1) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         // console.log(origin)
//         // console.log(req.headers)
//     }
//     // res.setHeader('Access-Control-Allow-Origin','https://cadrewill.com')
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Set-Cookie,Authorization,authorization');
//     // res.setHeader('Access-Control-Allow-Headers', '*');
//     // res.setHeader('Access-Control-Allow-Headers', true)

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });
// app.set("trust proxy", 1);



app.use(paymentRouter)
app.use(CourseRouter)
app.use(adminRouter)
app.use(userRouter)

const port = process.env.PORT || 3001


app.get('/',(req,res)=>{
    res.send('welcome to carrierwill app')
})


app.listen(port,()=>{
    console.log('server running at port '+ port)
})