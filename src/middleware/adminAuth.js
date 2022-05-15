
const jwt = require('jsonwebtoken')
const Admin = require('../database/models/admin')
const User = require('../database/models/user')
//in auth we are passing three aurg. next() function is call to end the function 
// jwt.verify takes two aurgement token and secret code  and return the id

const auth = async (req, res, next) => {
    let _id
    try {
        console.log('authHead->',req.headers.authorization)
        if(req.headers.authorization){
            _id = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)._id;
            if (!_id) throw new Error('Please login to Continue')
            console.log(_id)
        } else {
            _id = jwt.verify(req.cookies.token,process.env.JWT_SECRET)._id;
            if (!_id) throw new Error('Please login to Continue')
        }
    
        const user = await Admin.findById(_id.toString());
        if (!user) throw new Error('No Such User found')
        if(user.token !== req.headers.authorization){
            throw new Error('Loggedin from anoter device.Relogin to continue.')
        }
        req.user = user
        req.authentication = 'loggedin'
        next()
    } catch (e) {
        req.authentication = 'loggout'
        console.log(e.message)  
        // res.clearCookie('token')
        res.send({status:'failed',error:e.message,authentication:req.authentication})        
    }
}
module.exports = auth