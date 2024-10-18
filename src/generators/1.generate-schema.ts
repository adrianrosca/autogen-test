import "reflect-metadata";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { type GraphQLSchema, printSchema } from "graphql";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const typeDefs = `
  type User {
    id: ID!
    name: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!): User!
    updateUser(id: ID!, name: String): User
    deleteUser(id: ID!): Boolean!
  }
`;

// Placeholder resolvers
const resolvers = {
	Query: {
		users: () => [],
		user: () => null,
	},
	Mutation: {
		createUser: () => ({}),
		updateUser: () => null,
		deleteUser: () => false,
	},
};

async function generateSchema(): Promise<void> {
	const schema: GraphQLSchema = makeExecutableSchema({
		typeDefs,
		resolvers,
	});

	const dir = join(process.cwd(), "src", "_generated");

	if (!existsSync(dir)) {
		mkdirSync(dir);
	}

	const outputPath = join(dir, "schema.graphql");
	const printedSchema = printSchema(schema);

	writeFileSync(outputPath, printedSchema);
	console.log("Schema generated at", outputPath);
}

generateSchema().catch(console.error);
