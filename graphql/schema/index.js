

const {buildSchema} = require('graphql')

module.exports = buildSchema(`


    type Booking {
        _id:ID!
        event:Event!
        user:User!
        createdAt:String!
        updatedAt:String!
    }

    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!        
    }

    type User {
        _id:ID!
        name:String!
        email:String!
        password:String        
        createdEvents: [Event!]
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
        creatorId:String!
    }

    input UserInput {
        name:String!
        email:String!
        password:String!            
    }

    type RootQuery {
        events : [Event!]!
        user: [User!]!
        booking: [Booking!]!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput:UserInput): User
        bookEvent(eventId:ID!, userId:ID!):Booking!
        cancelBooking(bookingId:ID!):Event!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)