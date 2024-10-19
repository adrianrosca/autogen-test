import "reflect-metadata";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { generateSchema } from "./1.generate-schema";
import { ModelUtil } from "../utils/ModelUtil";

// function to get all model types from src/models
// ------------------------------------------------------------------------------------------
function getModelTypes(): string[] {
	const modelsDir = join(process.cwd(), "src", "models");
	const modelFiles = readdirSync(modelsDir).filter((file) => file.endsWith(".ts"));
	return modelFiles.map((file) => file.replace(".ts", ""));
}

// main function to run all generators for each type
// ------------------------------------------------------------------------------------------
async function generateAll(): Promise<void> {
	const modelTypes = getModelTypes();

	for (const modelType of modelTypes) {
		// extract fields from the current model
		// -------------------------------------
		const model = ModelUtil.loadModel(modelType);
		const fields = ModelUtil.extractFields(model);
		console.log(`Fields for ${modelType}:`, fields);

		await generateSchema(modelType, fields);
		// await generateIntrospection(type); // Call with type or necessary arguments
		// await generateGraphql(type); // Call with type or necessary arguments
		// await generateResolver(type); // Call with type or necessary arguments
	}

	console.log("All models have been processed.");
}

// start generation
generateAll().catch(console.error);
