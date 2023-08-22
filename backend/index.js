const express = require('express')

const mongoose = require('mongoose')

const cors = require('cors')

const cookieparser = require('cookie-parser')

const user_route = require('./routes/userRoutes')
const admin_route = require('./routes/adminRoutes')

const app = express()

app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}))

app.use(cookieparser())
app.use(express.urlencoded({ extended: true }));

app.use(express.json())

app.use("/",user_route)
app.use("/admin",admin_route)

app.use('/file',express.static('uploads'))

mongoose.connect("mongodb://localhost:27017/signUp",{}).then(()=>{
    console.log("connected to database");

    app.listen(5000,()=>{
        console.log("App is listening on port 5000");
    })
}).catch((error)=>{
    console.error('Error connecting to the database:',error)
})
