import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	type GraphQLSchema,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	type GraphQLType,
	buildSchema,
	isNamedType,
} from "graphql";
import { graphqlTemplate, typeTemplate, resolverTemplate } from "../templates/graphql-template";

function generateTypes(schema: GraphQLSchema): string {
	let types = "";
	const typeMap = schema.getTypeMap();

	for (const [typeName, type] of Object.entries(typeMap)) {
		if (type instanceof GraphQLObjectType && !typeName.startsWith("__")) {
			const fields = generateTypeFields(type);
			types += typeTemplate.replace(/{{TYPE_NAME}}/g, typeName).replace("{{TYPE_FIELDS}}", fields);
		}
	}

	return types;
}

function generateResolvers(schema: GraphQLSchema): string {
	let resolvers = "";
	const queryType = schema.getQueryType();
	const mutationType = schema.getMutationType();

	if (queryType) {
		resolvers += generateResolverType("Query", queryType);
	}
	if (mutationType) {
		resolvers += generateResolverType("Mutation", mutationType);
	}

	return resolvers;
}

function generateResolverType(typeName: string, type: GraphQLObjectType): string {
	const fields = generateResolverFields(type);
	return resolverTemplate.replace(/{{TYPE_NAME}}/g, typeName).replace("{{RESOLVER_FIELDS}}", fields);
}

function generateTypeFields(type: GraphQLObjectType): string {
	const fieldMap = type.getFields();
	return Object.entries(fieldMap)
		.map(([fieldName, field]) => `${fieldName}: ${getGraphQLType(field.type)};`)
		.join("\n  ");
}

function generateResolverFields(type: GraphQLObjectType): string {
	let fields = "";
	const fieldMap = type.getFields();

	for (const [fieldName, field] of Object.entries(fieldMap)) {
		const argsType =
			field.args.length > 0
				? `{ ${field.args.map((arg) => `${arg.name}: ${getGraphQLType(arg.type)}`).join(", ")} }`
				: "Record<string, never>";
		fields += `${fieldName}?: Resolver<${getGraphQLType(field.type)}, ParentType, ContextType, ${argsType}>,\n  `;
	}

	return fields.trim();
}

function getGraphQLType(type: GraphQLType): string {
	if (type instanceof GraphQLNonNull) {
		return getGraphQLType(type.ofType);
	}
	if (type instanceof GraphQLList) {
		return `Array<${getGraphQLType(type.ofType)}>`;
	}
	if (isNamedType(type)) {
		if (type.name === "Boolean") return "boolean";
		if (type.name === "Int" || type.name === "Float") return "number";
		if (type.name === "String" || type.name === "ID") return "string";
		return `GQL${type.name}`;
	}
	throw new Error(`Unsupported GraphQL type: ${type}`);
}

function generateGraphQLTypes(): void {
	const schemaPath = join(process.cwd(), "src", "_generated", "schema.graphql");
	const schemaContent = readFileSync(schemaPath, "utf-8");
	const schema = buildSchema(schemaContent);

	const types = generateTypes(schema);
	const resolvers = generateResolvers(schema);

	const content = graphqlTemplate
		.replace("{{TYPES}}", types)
		.replace("{{RESOLVERS}}", resolvers)
		.replace(
			"{{RESOLVER_TYPES}}",
			"Query?: GQLQueryResolvers<ContextType>;\n  Mutation?: GQLMutationResolvers<ContextType>;",
		);

	const outputPath = join(process.cwd(), "src", "_generated", "graphql.ts");
	writeFileSync(outputPath, content);
	console.log("GraphQL types generated at", outputPath);
}

generateGraphQLTypes();
