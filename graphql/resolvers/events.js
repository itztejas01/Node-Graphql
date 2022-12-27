const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date')

async function transformEvent (event) {
    return {
        ...event._doc,
        date:dateToString(event.date),
        creator: eventUser.bind(this,event.creator)
    }
}


async function getAllEvents (eventIds) {
    try{

    const events = await Event.find({_id:{$in:eventIds}})
        return events.map(async (event)=>{            
            return transformEvent(event)

        })
    }

    catch(err){
        console.log('err',err);
        throw err
    }
}

async function singleEvent (eventId){ 
    const event =  await Event.findById(eventId)
    return transformEvent(event)
}
 
async function eventUser(userId) {
    try{

        const user = await User.findById(userId)
        return {
            ...user._doc,
            password:null,
            createdEvents:getAllEvents.bind(this,user.createdEvents)
        }
    }catch(err){
        console.log('err',err);
        throw err
    }

}