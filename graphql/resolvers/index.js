const {hash} = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date')


async function transformEvent (event) {
    return {
        ...event._doc,
        // date:new Date(event.date).toDateString(),
        date:dateToString(event.date),
        creator: eventUser.bind(this,event.creator)
    }
}

function transformingBooking(booking){
    return {
        ...booking._doc,
        event:singleEvent.bind(this,booking.event),
        user:eventUser.bind(this,booking.user),                    
        createdAt:dateToString(booking.createdAt),                    
        updatedAt:dateToString(booking.updatedAt)
    }
}

async function getAllEvents (eventIds) {
    try{

    const events = await Event.find({_id:{$in:eventIds}})
        return events.map(async (event)=>{            
            return transformEvent(event)
            // return {
            //     ...event._doc,
            //     date:new Date(event.date).toDateString(),
            //     creator: eventUser.bind(this,event.creator)
            // }
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
            return transformEvent(obj)
            // return {
            //     ...obj._doc,
            //     date:new Date(obj.date).toDateString(),
            //     creator:eventUser.bind(this,obj.creator)
            // }
        });


        
    },
    booking: async() => {
        try{

            const allBookings = await Booking.find()

            return allBookings.map(booking=>{
                return transformingBooking(booking)
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
        
        return transformEvent(eventSave)
        // return {...eventSave._doc,creator:{...userCreatedEvent._doc}}
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
        return transformingBooking(result)
        // return {
        //     ...result._doc,
        //     event:singleEvent.bind(this,result.event),
        //     user:eventUser.bind(this,result.user),
        //     createdAt:dateToString(result.createdAt),
        //     updatedAt:dateToString(result.updatedAt)
        // }
    },
    cancelBooking:async (args) =>{
        try{
            const bookedEvent = await Booking.findById(args.bookingId).populate('event')

            if(bookedEvent){
                const event = transformEvent(bookedEvent.event)
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