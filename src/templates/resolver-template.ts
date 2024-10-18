export const resolverTemplate = `
import { UserModel } from "../models/User";
import type { GQLResolvers } from "./graphql";

export const resolvers: GQLResolvers = {
  Query: {
{{QUERY_RESOLVERS}}
  },
  Mutation: {
{{MUTATION_RESOLVERS}}
  },
};
`;

export const queryResolverTemplate = `    {{FIELD_NAME}}: async (_parent: unknown{{ARGS_WITH_TYPES}}{{CONTEXT_TYPE}}) => {
      {{IMPLEMENTATION}}
    },
`;

export const mutationResolverTemplate = `    {{FIELD_NAME}}: async (_parent: unknown{{ARGS_WITH_TYPES}}{{CONTEXT_TYPE}}) => {
      {{IMPLEMENTATION}}
    },
`;

// Implement the query and mutation logic directly in this file
export function getImplementationForField(fieldName: string): string {
	switch (fieldName) {
		case "users":
			return `
				const users = await UserModel.find().lean();
				return users.map(user => ({
					id: user._id.toString(),
					name: user.name
				}));
			`;
		case "user":
			return `
				const user = await UserModel.findById(id).lean();
				if (!user) {
					throw new Error('User not found');
				}
				return {
					id: user._id.toString(),
					name: user.name
				};
			`;
		case "createUser":
			return `
				const newUser = new UserModel({ name });
				const savedUser = await newUser.save();
				return {
					id: savedUser._id.toString(),
					name: savedUser.name
				};
			`;
		case "updateUser":
			return `
				const updatedUser = await UserModel.findByIdAndUpdate(id, { name }, { new: true }).lean();
				if (!updatedUser) {
					throw new Error('User not found');
				}
				return {
					id: updatedUser._id.toString(),
					name: updatedUser.name
				};
			`;
		case "deleteUser":
			return `
				const result = await UserModel.deleteOne({ _id: id });
				return result.deletedCount === 1;
			`;
		default:
			return "throw new Error('Not implemented');";
	}
}
