import { User } from "../../../dp-common/src/models/User";

// user service for interacting with the server
// --------------------------------------------
const API_BASE_URL = "/api";

export const createUser = async (user: User): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return response.json();
};

export const getUser = async (id: string): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/users/${id}`);
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return response.json();
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/users/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updates),
	});
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return response.json();
};

export const deleteUser = async (id: string): Promise<User> => {
	const response = await fetch(`${API_BASE_URL}/users/${id}`, {
		method: "DELETE",
	});
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return response.json();
};

export const loadUsers = async (): Promise<User[]> => {
	const response = await fetch(`${API_BASE_URL}/users`);
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return response.json();
};
