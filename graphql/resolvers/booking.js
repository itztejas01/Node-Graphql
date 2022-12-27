const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date')


function transformingBooking(booking){
    return {
        ...booking._doc,
        event:singleEvent.bind(this,booking.event),
        user:eventUser.bind(this,booking.user),                    
        createdAt:dateToString(booking.createdAt),                    
        updatedAt:dateToString(booking.updatedAt)
    }
}