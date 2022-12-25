const mongoose = require('mongoose')

const Schema = mongoose.Schema

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
    
})

// eventSchema.virtual('id').get(function(){
//     return this._id.toHexString();
// })

eventSchema.method('toJSON',function(){
    const {__v,...object} = this.toObject()
    const {_id:id,...result} = object
    return {...result,id}
})

module.exports = mongoose.model('Event',eventSchema)
