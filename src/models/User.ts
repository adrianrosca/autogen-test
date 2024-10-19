import { prop, getModelForClass } from "@typegoose/typegoose";
import { Field, ObjectType, ID } from "type-graphql";

@ObjectType()
export class User {
	@Field(() => ID)
	_id!: string;
	@Field(() => String)
	@prop({ type: () => String, required: true })
	name!: string;
}

export const UserModel = getModelForClass(User);
