const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
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
        }
    }
}

module.exports = resolvers; 