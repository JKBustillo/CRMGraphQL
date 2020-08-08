const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }

    type Token {
        token: String
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    type Query {
        getUser(token: String!): User
    }

    type Mutation {
        newUser(input: UserInput): User
        userAuth(input: AuthInput): Token
    }
`;

module.exports = typeDefs;