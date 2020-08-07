const User = require("../models/User");
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
        getAny: () => "E"
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

        }
    }
}

module.exports = resolvers; 