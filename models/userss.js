const mongoose= require('mongoose')
const userSchema= new mongoose.Schema({
    name:{
        type: String,
        requiered:true
    },
      email:{
        type: String,
        requiered:true
    },
    phone:{
        type: String,
        requiered:true
    }, 
     image:{
        type: String,
        requiered:true
    },
    created:{
        type: Date,
        default:Date.now
    }
}
)
module.exports=mongoose.model('users2',userSchema)