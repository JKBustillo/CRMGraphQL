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

    type Query {
        getAny: String
    }

    type Mutation {
        newUser: User
    }
`;

module.exports = typeDefs;