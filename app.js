const express = require('express');
const body_parser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();


app.use(body_parser.json());
const events = [];

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
        events: () => {
            return events;
        },
        createEvent: (args)=>{
            const event = {
                _id:Math.random().toString(),
                title:args.eventInput.title, 
                description: args.eventInput.description, 
                price: +args.eventInput.price, 
                date: args.eventInput.date   
            }
            events.push(event)
            return event     
        }
    },
    graphiql:true
}));

app.get('/',(req,res,next)=>{
    res.send('hello world')
})

app.listen(3000,()=>{
    console.log('listening');
})