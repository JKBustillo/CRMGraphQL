// Resolvers
const resolvers = {
    Query: {
        getAny: () => "E"
    },
    Mutation: {
        newUser: (_, { input }) => {
            console.log(input);
            
            return "New User WIP"
        }
    }
}

module.exports = resolvers; 