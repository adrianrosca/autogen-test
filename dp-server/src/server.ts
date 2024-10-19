import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyCors from "@fastify/cors";
import mongoose from "mongoose";
import { CRUD } from "./helper/CrudUtil";
import { UserDocument, UserModel, User } from "../../dp-common/src/models/User";

// create fastify instance
// -----------------------
const fastify = Fastify({ logger: true });

// enable cors
// -----------
fastify.register(fastifyCors, { origin: true });

// create user crud instance
// -------------------------
const userCrud = new CRUD<UserDocument>(UserModel);

// connect to mongodb
// ------------------
const connectDB = async () => {
	try {
		await mongoose.connect("mongodb://localhost:27017/mydatabase");
		fastify.log.info("MongoDB connected");
	} catch (err) {
		fastify.log.error("MongoDB connection error:", err);
		process.exit(1);
	}
};

// create user route
// -----------------
fastify.post("/users", async (request: FastifyRequest, reply: FastifyReply) => {
	const user = new User(request.body as User);
	const createdUser = await userCrud.create(user);
	reply.code(201).send(createdUser);
});

// read user route
// ---------------
fastify.get("/users/:id", async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const user = await userCrud.findById(id);
	if (user) {
		reply.send(user);
	} else {
		reply.code(404).send({ message: "User not found" });
	}
});

// update user route
// -----------------
fastify.put("/users/:id", async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const updatedUser = await userCrud.update(id, request.body as Partial<User>);
	if (updatedUser) {
		reply.send(updatedUser);
	} else {
		reply.code(404).send({ message: "User not found" });
	}
});

// delete user route
// -----------------
fastify.delete("/users/:id", async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.params as { id: string };
	const deletedUser = await userCrud.delete(id);
	if (deletedUser) {
		reply.send(deletedUser);
	} else {
		reply.code(404).send({ message: "User not found" });
	}
});

// load all users route
// --------------------
fastify.get("/users", async (_request: FastifyRequest, reply: FastifyReply) => {
	try {
		const users = await userCrud.findAll();
		reply.send(users);
	} catch (error: any) {
		reply.code(500).send({ message: "Error loading users", error: error.message });
	}
});

// start server
// ------------
const start = async () => {
	try {
		await connectDB();
		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		fastify.log.info("Server listening on http://localhost:3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

// graceful shutdown
// -----------------
const shutdown = async () => {
	try {
		await fastify.close();
		await mongoose.disconnect();
		fastify.log.info("Server and database connection closed successfully");
	} catch (err) {
		fastify.log.error("Error while shutting down", err);
	}
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
