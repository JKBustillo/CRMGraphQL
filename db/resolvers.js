const User = require("../models/User");
const bcryptjs = require('bcryptjs');

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
        }
    }
}

module.exports = resolvers; 