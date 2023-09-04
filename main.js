const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const session = require('express-session')


const app=express()
const PORT= process.env.PORT||4000

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(error => {
    console.error('Error connecting to MongoDB:', error);
});

//middlewares
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(session({
    secret:'my secret key',
    resave: false,
    saveUninitialized:true,
}))
app.use((req,res,next)=>{
    res.locals.message=req.session.message
    delete req.session.message
    next()
})

app.use(express.static("uploads"))

//set template engine
app.set('view engine', 'ejs')

//route prefix
 
app.use("",require('./routes/routes'))

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}...`)
})