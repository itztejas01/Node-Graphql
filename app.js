require('dotenv/config')
const express = require('express');
const body_parser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const mongoose = require("mongoose");
const app = express();


const graphQLSchema = require('./graphql/schema')
const graphQLResolvers = require('./graphql/resolvers')


app.use(body_parser.json());



app.use('/graphqlApi',graphqlHTTP({
    schema:graphQLSchema,
    rootValue:graphQLResolvers,
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

