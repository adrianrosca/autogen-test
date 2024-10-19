import "reflect-metadata";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { type GraphQLSchema, printSchema } from "graphql";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// custom field type definition function
// ------------------------------------------------------------------------------------------
function generateTypeDefs(typeName: string, fields: { [key: string]: string }): string {
	const fieldDefs = Object.entries(fields)
		.map(([fieldName, fieldType]) => `${fieldName}: ${fieldType}!`)
		.join("\n");

	return `
    type ${typeName} {
      ${fieldDefs}
    }

    type Query {
      ${typeName.toLowerCase()}s: [${typeName}!]!
      ${typeName.toLowerCase()}(id: ID!): ${typeName}
    }

    type Mutation {
      create${typeName}(${Object.entries(fields)
				.map(([fieldName, fieldType]) => `${fieldName}: ${fieldType}!`)
				.join(", ")}): ${typeName}!
      update${typeName}(id: ID!, ${Object.entries(fields)
				.map(([fieldName, fieldType]) => `${fieldName}: ${fieldType}`)
				.join(", ")}): ${typeName}
      delete${typeName}(id: ID!): Boolean!
    }
  `;
}

// dynamic resolvers generation function based on the type name
// ------------------------------------------------------------------------------------------
function generateResolvers(typeName: string) {
	const pluralName = `${typeName.toLowerCase()}s`;
	const singularName = typeName.toLowerCase();

	return {
		Query: {
			[pluralName]: () => [], // e.g., users: () => []
			[singularName]: () => null, // e.g., user: () => null
		},
		Mutation: {
			[`create${typeName}`]: () => ({}), // e.g., createUser: () => ({})
			[`update${typeName}`]: () => null, // e.g., updateUser: () => null
			[`delete${typeName}`]: () => false, // e.g., deleteUser: () => false
		},
	};
}

// schema generation function with dynamic fields and resolvers
// ------------------------------------------------------------------------------------------
export async function generateSchema(typeName: string, fields: { [key: string]: string }): Promise<void> {
	const typeDefs = generateTypeDefs(typeName, fields);
	const resolvers = generateResolvers(typeName);

	const schema: GraphQLSchema = makeExecutableSchema({
		typeDefs,
		resolvers,
	});

	const dir = join(process.cwd(), "src", "_generated");

	if (!existsSync(dir)) {
		mkdirSync(dir);
	}

	const outputPath = join(dir, `${typeName.toLowerCase()}.schema.graphql`);
	const printedSchema = printSchema(schema);

	writeFileSync(outputPath, printedSchema);
	console.log(`Schema generated at ${outputPath}`);
}
