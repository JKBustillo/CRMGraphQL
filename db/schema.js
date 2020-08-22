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

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        enterprise: String
        email: String
        telephone: String
        seller: ID
    }

    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        date: String
        state: OrderState
    }

    type OrderGroup {
        id: ID
        amount: Int
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
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

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        name: String!,
        lastName: String!,
        enterprise: String!,
        email: String!,
        telephone: String
    }

    input OrderProductInput {
        id: ID
        amount: Int
    }

    input OrderInput {
        order: [OrderProductInput]
        total: Float!
        client: ID!
        state: OrderState
    }

    enum OrderState {
        PENDING
        COMPLETED
        CANCELED
    }

    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        # Clients
        getClients: [Client]
        getClientsSeller: [Client]
        getClient(id: ID!): Client

        # Orders
        getOrders: [Order]
        getOrderSeller: [Order]
        getOrder(id: ID!): Order
        getOrdersState(state: String!): [Order]

        # Advanced
        bestClients: [TopClient]
        bestSellers: [TopSeller]
    }

    type Mutation {
        # Users
        newUser(input: UserInput): User
        userAuth(input: AuthInput): Token

        # Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        # Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String

        # Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }
`;

module.exports = typeDefs;