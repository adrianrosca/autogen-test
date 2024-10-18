
import { UserModel } from "../models/User";
import type { GQLResolvers } from "./graphql";

export const resolvers: GQLResolvers = {
  Query: {
    users: async (_parent: unknown, _context: unknown) => {
      
				const users = await UserModel.find().lean();
				return users.map(user => ({
					id: user._id.toString(),
					name: user.name
				}));
			
    },
    user: async (_parent: unknown, { id }: { id: string }, _context: unknown) => {
      
				const user = await UserModel.findById(id).lean();
				if (!user) {
					throw new Error('User not found');
				}
				return {
					id: user._id.toString(),
					name: user.name
				};
			
    },

  },
  Mutation: {
    createUser: async (_parent: unknown, { name }: { name: string }, _context: unknown) => {
      
				const newUser = new UserModel({ name });
				const savedUser = await newUser.save();
				return {
					id: savedUser._id.toString(),
					name: savedUser.name
				};
			
    },
    updateUser: async (_parent: unknown, { id, name }: { id: string; name: string }, _context: unknown) => {
      
				const updatedUser = await UserModel.findByIdAndUpdate(id, { name }, { new: true }).lean();
				if (!updatedUser) {
					throw new Error('User not found');
				}
				return {
					id: updatedUser._id.toString(),
					name: updatedUser.name
				};
			
    },
    deleteUser: async (_parent: unknown, { id }: { id: string }, _context: unknown) => {
      
				const result = await UserModel.deleteOne({ _id: id });
				return result.deletedCount === 1;
			
    },

  },
};
