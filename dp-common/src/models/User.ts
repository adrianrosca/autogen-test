import { prop, modelOptions, DocumentType, getModelForClass } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
	_id?: string;

	@prop({ type: () => String, required: true })
	name!: string;

	constructor(user?: Partial<User>) {
		if (user) {
			Object.assign(this, user);
		}
	}
}

export type UserDocument = DocumentType<User>;

export const UserModel = getModelForClass<typeof User>(User);
