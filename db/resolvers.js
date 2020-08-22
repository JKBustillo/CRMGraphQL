const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Order = require("../models/Order");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config({path: '.env'});

const createToken = (user, secret, expiresIn) => {
    const { id, email, name, lastName } = user;

    return jwt.sign({ id, email, name, lastName }, secret, { expiresIn });
}

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.SECRET);

            return userId;
        },
        getProducts: async () => {
            try {
                const products = await Product.find({});

                return products;
            } catch (error) {
                console.log(error);
            }
        },
        getProduct: async (_, { id }) => {
            // Check if products exists
            const product = await Product.findById(id);

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        },
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients;
            } catch (error) {
                console.log(error);
            }
        },
        getClientsSeller: async (_, {}, ctx) => {
            try {
                const clients = await Client.find({seller: ctx.user.id.toString()});
                return clients;
            } catch (error) {
                console.log(error);
            }
        },
        getClient: async (_, {id}, ctx) => {
            // Check if client exists
            const client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found");
            }

            if (client.seller.toString() !== ctx.user.id.toString()) {
                throw new Error("You're not allowed to see this");
            }

            return client;
        },
        getOrders: async () => {
            try {
                const orders = await Order.find({});

                return orders;
            } catch (error) {
                console.log(error);
            }
        },
        getOrderSeller: async (_, {}, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id });

                return orders;
            } catch (error) {
                console.log(error);
            }
        }
    },
    Mutation: {
        newUser: async (_, { input }) => {
            const {email, password} = input;

            // Check if user exist
            const userExists = await User.findOne({email});
            if (userExists) {
                throw new Error('User already exists');
            }

            // Hash password
            const salt = bcryptjs.genSaltSync(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                // Store in DB
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(Error);
            }
        },
        userAuth: async (_, { input }) => {
            const { email, password } = input;

            // if user exists
            const userExists = await User.findOne({email});
            if (!userExists) {
                throw new Error("User doesn's exists");
            }

            // Check password
            const rightPassword = await bcryptjs.compare(password, userExists.password);

            if (!rightPassword) {
                throw new Error("Password is wrong");
            }

            // Create token
            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }

        },
        newProduct: async (_, { input }) => {
            try {
                const newProduct = new Product(input);

                // Store in DB
                const response = await newProduct.save();

                return response;
            } catch (error) {
                console.log(error);
            }
        },
        updateProduct: async (_, { id, input }) => {
            // Check if products exists
            let product = await Product.findById(id);

            if (!product) {
                throw new Error('Product not found');
            }

            // Store in DB
            product = await Product.findByIdAndUpdate({ _id: id }, input, { new: true });

            return product;
        },
        deleteProduct: async (_, { id }) => {
            // Check if products exists
            let product = await Product.findById(id);

            if (!product) {
                throw new Error('Product not found');
            }

            await Product.findOneAndDelete({ _id: id });

            return "Product Deleted";
        },
        newClient: async (_, { input }, ctx) => {
            const { email } = input;

            // Check if client exists
            const client = await Client.findOne({ email });
            if (client) {
                throw new Error('This client already exists');
            }

            const newClient = new Client(input);

            // Set the seller
            newClient.seller = ctx.user.id;

            // Save in DB
            try {
                const result = await newClient.save();

                return result;
            } catch (error) {
                console.log(error);
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            // Check if client exists
            let client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found");
            }

            // Check if the seller is who edits
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("You're not allowed to see this");
            }

            // Save client
            client = await Client.findOneAndUpdate({_id: id}, input, {new: true});
            
            return client;
        },
        deleteClient: async (_, { id }, ctx) => {
            // Check if client exists
            let client = await Client.findById(id);

            if (!client) {
                throw new Error("Client not found");
            }

            // Check if the seller is who edits
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error("You're not allowed to see this");
            }

            // Delete client
            await Client.findByIdAndDelete({_id: id});

            return "Client deleted";
        },
        newOrder: async (_, { input }, ctx) => {
            const { client } = input;

            // Check if client exists
            let clientExists = await Client.findById(client);

            if (!clientExists) {
                throw new Error("Client not found");
            }

            // Check if seller has the client
            if (clientExists.seller.toString() !== ctx.user.id) {
                throw new Error("You're not allowed to see this");
            }

            // Check if there's stock available
            for await (const item of input.order) {
                const { id } = item;

                const product = await Product.findById(id);

                if (item.amount > product.stock) {
                    throw new Error(`The item ${product.name} exceeds the available amount`);
                } else {
                    product.stock = product.stock - item.amount;

                    await product.save();
                }
            }

            // Create a new order
            const newOrder = new Order(input);

            // Set a seller
            newOrder.seller = ctx.user.id;

            // Save in DB
            const response = await newOrder.save();

            return response;
        }
    }
}

module.exports = resolvers; 