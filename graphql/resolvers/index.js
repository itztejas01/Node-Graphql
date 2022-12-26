const {hash} = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');


async function getAllEvents (eventIds) {
    try{

    const events = await Event.find({_id:{$in:eventIds}})
        return events.map(async (event)=>{
            const data = await eventUser(event.creator)
            return {
                ...event._doc,
                date:new Date(event.date).toDateString(),
                creator: eventUser.bind(this,event.creator)
            }
        })
    }

    catch(err){
        console.log('err',err);
        throw err
    }
}

async function singleEvent (eventId){ 
    const event =  await Event.findById(eventId)
    return {
        ...event._doc,
        creator:eventUser.bind(this,event.creator)
    }
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

module.exports = {
    user: async () =>{
        const user = await User.find()

        return user.map(async (obj)=>{
            const data = await getAllEvents(obj.createdEvents)
            
            return {...obj._doc,password:null,createdEvents:[...data]}

        })
        
    },
    events: async() => {
        const allEvent = await Event.find()


        return allEvent.map(async (obj) => {            
            
            return {...obj._doc,date:new Date(obj.date).toDateString(),creator:eventUser.bind(this,obj.creator)}
        });


        
    },
    booking: async() => {
        try{

            const allBookings = await Booking.find()

            return allBookings.map(booking=>{
                return {
                    ...booking._doc,
                    event:singleEvent.bind(this,booking.event),
                    user:eventUser.bind(this,booking.user),
                    createdAt:new Date(booking.createdAt).toDateString(),
                    updatedAt:new Date(booking.updatedAt).toDateString()
                }
            })

        }catch(err){
            throw err
        }
    },
    createEvent: async (args)=>{            
        const event = new Event({              
            title:args.eventInput.title, 
            description: args.eventInput.description, 
            price: +args.eventInput.price, 
            date: new Date(args.eventInput.date),
            creator:args.eventInput.creatorId
        })

        const eventSave =  await event.save();
        const userCreatedEvent = await User.findByIdAndUpdate(args.eventInput.creatorId,{
            $addToSet:{
                createdEvents: eventSave.id
            }
        })

        if(!userCreatedEvent){
            throw new Error('Updated not happended in user!')
        }        
        
        return {...eventSave._doc,creator:{...userCreatedEvent._doc}}
    },
    createUser: async (args) =>{
        try{

            const findUser = await User.findOne({email:args.userInput.email})

            if(findUser){
                throw new Error('User Already Exist!')
            }

            const hashPassword = await hash(args.userInput.password,12)
            const user = new User({
                name:args.userInput.name,
                email:args.userInput.email,
                password:hashPassword
            })

            const userSave = await user.save()

            return {...userSave._doc,password:null}

        }catch(err){
            console.log('error',err);
            throw new Error(err)
        }

    },
    bookEvent:async (args)=>{
        const booking = new Booking({
            user:args.userId,
            event:args.eventId
        })
        const result = await booking.save()
        return {
            ...result._doc,
            event:singleEvent.bind(this,result.event),
            user:eventUser.bind(this,result.user),
            createdAt:new Date(result.createdAt).toDateString(),
            updatedAt:new Date(result.updatedAt).toDateString()
        }
    },
    cancelBooking:async (args) =>{
        try{
            const bookedEvent = await Booking.findById(args.bookingId).populate('event')

            if(bookedEvent){
                const event = {
                    ...bookedEvent.event,
                    creator:eventUser.bind(this,bookedEvent.event.creator)
                }
                await Booking.deleteOne({_id:args.bookingId})
                return event                
            }else{
                throw new Error('Given event is not there!')
            }
        }catch(err){
            console.log(err);
            throw err
        }
    }
}