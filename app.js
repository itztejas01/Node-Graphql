require('dotenv/config')
const express = require('express');
const body_parser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require("mongoose");
const app = express();

const Event = require('./models/event')

app.use(body_parser.json());


app.use('/graphqlApi',graphqlHTTP({
    schema:buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events : [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue:{
        events: async() => {
            const allEvent = await Event.find()

            return allEvent;
        },
        createEvent: async (args)=>{
            // const event = {
            //     _id:Math.random().toString(),
            //     title:args.eventInput.title, 
            //     description: args.eventInput.description, 
            //     price: +args.eventInput.price, 
            //     date: args.eventInput.date   
            // }

            const event = new Event({              
                title:args.eventInput.title, 
                description: args.eventInput.description, 
                price: +args.eventInput.price, 
                date: new Date(args.eventInput.date)
            })

            const eventSave =  await event.save();
            console.log('event',eventSave);
            
            return {...eventSave._doc}
        }
    },
    graphiql:true
}));


mongoose.connect(process.env.MONGOOSE_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'graphqldb'
}).then(()=>{
    app.listen(3000,()=>{
        console.log('listening');
    })
}).catch(e=>{
    console.log('err',e);
})

