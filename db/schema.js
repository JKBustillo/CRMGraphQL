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

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    type Query {
        getAny: String
    }

    type Mutation {
        newUser(input: UserInput): String
    }
`;

module.exports = typeDefs;