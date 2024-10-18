import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	buildSchema,
	GraphQLList,
	GraphQLNonNull,
	isScalarType,
	type GraphQLObjectType,
	type GraphQLSchema,
} from "graphql";
import {
	queryResolverTemplate,
	mutationResolverTemplate,
	resolverTemplate,
	getImplementationForField, // Make sure to import this
} from "../templates/resolver-template";

function generateResolvers(schema: GraphQLSchema): string {
	let queryResolvers = "";
	let mutationResolvers = "";
	const queryType = schema.getQueryType();
	const mutationType = schema.getMutationType();

	if (queryType) {
		queryResolvers = generateTypeResolvers(queryType, queryResolverTemplate);
	}
	if (mutationType) {
		mutationResolvers = generateTypeResolvers(
			mutationType,
			mutationResolverTemplate,
		);
	}

	// replace templates for query and mutation
	return resolverTemplate
		.replace("{{QUERY_RESOLVERS}}", queryResolvers)
		.replace("{{MUTATION_RESOLVERS}}", mutationResolvers);
}

function generateTypeResolvers(
	type: GraphQLObjectType,
	template: string,
): string {
	let resolvers = "";
	const fields = type.getFields();

	for (const [fieldName, field] of Object.entries(fields)) {
		// generate destructured arguments and their types
		const argNames = field.args.map((arg) => arg.name).join(", ");
		const argsWithTypes = field.args
			.map((arg) => `${arg.name}: ${getGraphQLType(arg.type)}`)
			.join("; ");
		const argsTemplate = argNames
			? `{ ${argNames} }: { ${argsWithTypes} }`
			: "";
		const contextTemplate = ", _context: unknown";

		const resolverCode = template
			.replace("{{FIELD_NAME}}", fieldName)
			.replace("{{ARGS_WITH_TYPES}}", argsTemplate ? `, ${argsTemplate}` : "")
			.replace("{{CONTEXT_TYPE}}", contextTemplate)
			.replace("{{IMPLEMENTATION}}", getImplementationForField(fieldName));

		resolvers += resolverCode;
	}

	return resolvers;
}

function getGraphQLType(type: unknown): string {
	// check if it's a non-nullable type
	if (type instanceof GraphQLNonNull) {
		return getGraphQLType(type.ofType);
	}

	// check if it's a list type
	if (type instanceof GraphQLList) {
		return `${getGraphQLType(type.ofType)}[]`;
	}

	// map scalar types to TypeScript types
	if (isScalarType(type)) {
		switch (type.name) {
			case "Int":
				return "number";
			case "Float":
				return "number";
			case "String":
				return "string";
			case "Boolean":
				return "boolean";
			case "ID":
				return "string"; // typically IDs are represented as strings in most APIs
			default:
				throw new Error(`Unknown scalar type: ${type.name}`);
		}
	}

	// fallback for custom object types, assume they will map to a string as an ID or complex type
	return "any"; // fallback, or map to a more specific type if you know the custom types
}

function generateResolverFile(): void {
	const schemaPath = join(process.cwd(), "src", "_generated", "schema.graphql");
	const schemaContent = readFileSync(schemaPath, "utf-8");
	const schema = buildSchema(schemaContent);

	const resolverContent = generateResolvers(schema);

	const outputPath = join(process.cwd(), "src", "_generated", "resolvers.ts");
	writeFileSync(outputPath, resolverContent);
	console.log(`Resolvers generated at ${outputPath}`);
}

generateResolverFile();
