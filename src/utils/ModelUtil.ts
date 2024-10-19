import type { ReturnModelType } from "@typegoose/typegoose";
import { join } from "node:path";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";

export class ModelUtil {
	// load model
	// ------------------------------------------------------------------------------------------
	static loadModel(modelPath: string = join()): any {
		const modelModule = require(modelPath);
		return modelModule.default;
	}

	// extract fields from a Typegoose model file
	// ------------------------------------------------------------------------------------------
	static extractFieldsOLD(modelContent: string): Record<string, string> {
		// Adjusted regex to match @Field and @prop decorators and allow flexibility in spacing
		const fieldRegex = /@Field\(\(\)\s*=>\s*(\w+)\)[\s\S]*?@prop\([^)]*\)[\s\S]*?(\w+)!/g;

		const fields: { [key: string]: string } = {};
		let match: RegExpExecArray | null;

		// Iterate through all matches
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		while ((match = fieldRegex.exec(modelContent)) !== null) {
			const graphqlType = match[1]; // Extract GraphQL type from @Field decorator
			const fieldName = match[2]; // Extract the field name after @prop

			// Map TypeScript types to GraphQL types
			const fieldType: string =
				graphqlType === "String"
					? "String"
					: graphqlType === "Number"
						? "Float"
						: graphqlType === "Boolean"
							? "Boolean"
							: graphqlType === "ID"
								? "ID"
								: graphqlType;

			fields[fieldName] = `${fieldType}!`; // Dynamically assign GraphQL type
		}

		// Return the dynamically generated fields
		return fields;
	}

	static extractFields<T extends AnyParamConstructor<any>>(model: ReturnModelType<T>): Record<string, string> {
		const schema = model.schema; // Get the underlying Mongoose schema
		const fields: Record<string, string> = {};

		// Iterate over schema paths and map field types to GraphQL equivalents
		for (const [field, schemaType] of Object.entries(schema.paths)) {
			const type = schemaType as any; // Use any to allow flexibility for schemaType fields

			if (field === "_id") {
				fields._id = "ID!";
			} else {
				switch (type.instance) {
					case "String":
						fields[field] = "String!";
						break;
					case "Number":
						fields[field] = "Float!";
						break;
					case "Boolean":
						fields[field] = "Boolean!";
						break;
					default:
						fields[field] = type.instance; // Use the instance type for other fields
				}
			}
		}

		return fields;
	}
}

// // ------------------------------------------------------------------------------------------
// // Generate type User from extracted fields
// const fieldsArr = Object.entries(fields).map(([fieldName, fieldType]) => {
// 	return `${fieldName}: ${fieldType}!`;
// });

// const _type = `type ${modelName} {\n  ${fieldsArr.join("\n  ")}\n}`;

// // Dynamically generate Query type
// const pluralModelName = `${modelName.toLowerCase()}s`;
// const singularModelName = modelName.toLowerCase();

// const queryType = [
// 	`type Query {
// 	  ${pluralModelName}: [${modelName}!]!
// 	  ${singularModelName}(id: ID!): ${modelName}
// 	}`,
// ].join("\n");

// // Dynamically generate Mutation type
// const createArgsArray = Object.entries(fields)
// 	.filter(([key]) => key !== "_id")
// 	.map(([key, type]) => `${key}: ${type}`);

// const updateArgsArray = Object.entries(fields)
// 	.filter(([key]) => key !== "_id")
// 	.map(([key, type]) => `${key}: ${type.replace("!", "")}`);

// const mutationType = [
// 	`type Mutation {
// 	  create${modelName}(${createArgsArray.join(", ")}): ${modelName}!
// 	  update${modelName}(id: ID!, ${updateArgsArray.join(", ")}): ${modelName}
// 	  delete${modelName}(id: ID!): Boolean!
// 	}`,
// ].join("\n");

// // Combine schema
// const schema = `${_type}\n\n${queryType}\n\n${mutationType}`;
// return schema;
