import mongoose from "mongoose";
import { UserModel } from "./src/models/User";

async function main() {
	// Connect to MongoDB
	await mongoose.connect("mongodb://localhost:27017/mydatabase");

	console.log("MongoDB connected");

	// Create a new user (no need to set `id` manually)
	const newUser = new UserModel({
		name: "John Doe",
	});

	// Save the user to the database
	await newUser.save();
	console.log("User saved:", newUser);

	// Load the user back from the database
	const loadedUser = await UserModel.findById(newUser._id);

	if (loadedUser) {
		console.log("Loaded User:", loadedUser);
	} else {
		console.log("User not found");
	}

	// Close the connection after use
	await mongoose.disconnect();
	console.log("MongoDB connection closed");
}

main().catch((err) => console.error(err));
