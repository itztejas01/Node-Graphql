require('dotenv/config')
const express = require('express');
const body_parser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const {hash} = require('bcryptjs')
const mongoose = require("mongoose");
const app = express();

const Event = require('./models/event')
const User = require('./models/user')

app.use(body_parser.json());

async function eventUser(userId) {
    return User.findById(userId).then(obj=>{
        return {...obj._doc,_id:obj.id}
    })

    // const data = {...userData.toObject()}

    // return data
}


app.use('/graphqlApi',graphqlHTTP({
    schema:buildSchema(`

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
            message:String
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
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput:UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue:{
        user: async () =>{
            const user = await User.find().populate('createdEvents')
            return user
        },
        events: async() => {
            const allEvent = await Event.find()

            const userEvent = [] 

            // const val =  allEvent.toArray()
            console.log('all evet',allEvent.map(async obj => await eventUser(obj.creator._id)));
            // allEvent.map(async event=>{
            //     userEvent.push(eventUser(event.creator).then(user=>user))
            // },()=>done(userEvent))
            // console.log('userEvent',await allEvent.map(async event=>{eventUser(event.creator).then(user=>user)}));
            // console.log('userEvent',typeof val);
            // console.log('user',allEvent.map(async event=>{eventUser.bind(this,event.creator)}));


            return allEvent;
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
            // console.log('event',eventSave);
            
            return {...eventSave._doc,...userCreatedEvent._doc}
        },
        createUser: async (args) =>{
            try{

                const findUser = await User.findOne({email:args.userInput.email})

                if(findUser){
                    return {message:'user Already Exist'}
                }
                const hashPassword = await hash(args.userInput.password,12)
                const user = new User({
                    name:args.userInput.name,
                    email:args.userInput.email,
                    password:hashPassword
                })
    
                const userSave = await user.save()

                return {...userSave._doc,password:null,message:'User Created Successfully'}

            }catch(e){
                console.log('error',e);
                throw e
            }

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

