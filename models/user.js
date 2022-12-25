const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    createdEvents:[{
        type:Schema.Types.ObjectId,
        ref:'Event'        
    }]
    
})


userSchema.method('toJSON',function(){
    const {__v,...object} = this.toObject()
    const {_id:id,...result} = object
    return {...result,id}
})

module.exports = mongoose.model('User',userSchema)
