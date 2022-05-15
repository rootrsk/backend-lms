const mongoose = require('mongoose')
try {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },()=>{
        console.log('connected to database')
    })
} catch (e) {
    console.log(e.message)
}