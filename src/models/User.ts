import { prop, getModelForClass } from "@typegoose/typegoose";
import { Field, ObjectType, ID } from "type-graphql";

@ObjectType()
export class User {
	@Field(() => ID)
	_id!: string; // Mongoose handles this automatically

	@Field(() => String)
	@prop({ type: () => String, required: true }) // Ensure type is properly defined
	name!: string;
}

export const UserModel = getModelForClass(User);
