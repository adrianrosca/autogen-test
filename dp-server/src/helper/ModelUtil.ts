import { getModelForClass, type ReturnModelType } from "@typegoose/typegoose";
import { join } from "node:path";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";

export class ModelUtil {
	// load model
	// ------------------------------------------------------------------------------------------
	static loadModel<T extends AnyParamConstructor<any>>(
		modelType: string,
		modelsPath: string = join(process.cwd(), "src", "models"),
	): ReturnModelType<T> {
		// construct the path to the model file
		const filePath = join(modelsPath, `${modelType}.ts`);

		// dynamically import the module
		const modelModule = require(filePath);

		// retrieve and return the actual Typegoose model
		return getModelForClass(modelModule[modelType]) as ReturnModelType<T>;
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
		// get the underlying Mongoose schema
		const schema = model.schema;

		// initialize the fields object
		const fields: Record<string, string> = {};

		// iterate over schema paths and map field types to GraphQL equivalents
		for (const [field, schemaType] of Object.entries(schema.paths)) {
			const type = schemaType as any; // use any to allow flexibility for schemaType fields

			if (field === "_id") {
				fields._id = "ID!";
			} else {
				// generalize the type extraction for better reuse
				fields[field] = ModelUtil.extractType(type);
			}
		}

		return fields;
	}

	static extractType(type: any): string {
		switch (type.instance) {
			case "String":
				return "String!";
			case "Number":
				return "Float!";
			case "Boolean":
				return "Boolean!";
			case "Array":
				return `[${ModelUtil.extractType(type.caster)}!]`; // recursive call for array elements
			default:
				return type.instance; // fallback to instance for unhandled types
		}
	}
}
