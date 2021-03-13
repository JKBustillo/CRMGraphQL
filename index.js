const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
require("dotenv").config({path: '.env'});

connectDB();

// server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'].replace('Bearer ', '') || "";

        if (token) {
            try {
                const user = jwt.verify(token, process.env.SECRET);

                return {
                    user
                }
            } catch (error) {
                console.log('Error');
                console.log(error);
            }
        }
    }
});

server.listen().then(({url}) => {
    console.log(`Server running in ${url}`);
});