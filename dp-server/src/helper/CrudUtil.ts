import { Model, Document } from "mongoose";
import { ReturnModelType } from "@typegoose/typegoose";

export class CRUD<T extends Document> {
	private model: Model<T> & ReturnModelType<any, any>;

	constructor(model: Model<T> & ReturnModelType<any, any>) {
		this.model = model;
	}

	// create: create a new document in the database
	// ---------------------------------------------
	async create(entity: Partial<T>): Promise<T> {
		const newDocument = new this.model(entity);
		return await newDocument.save();
	}

	// read: find a document by id
	// ---------------------------
	async findById(id: string): Promise<T | null> {
		return await this.model.findById(id).exec();
	}

	// update: update a document in the database
	// -----------------------------------------
	async update(id: string, updatedFields: Partial<T>): Promise<T | null> {
		return await this.model.findByIdAndUpdate(id, updatedFields, { new: true }).exec();
	}

	// delete: delete a document by id
	// -------------------------------
	async delete(id: string): Promise<T | null> {
		return await this.model.findByIdAndDelete(id).exec();
	}

	// findall: retrieve all documents from the database
	// -------------------------------------------------
	async findAll(): Promise<T[]> {
		return await this.model.find().exec();
	}
}
