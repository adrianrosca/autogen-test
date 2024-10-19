import { useState, useEffect, useCallback } from "react";
import { loadUsers, createUser, getUser, updateUser, deleteUser } from "./userService";
import { User } from "../../../dp-common/src/models/User";

// user management hook
// --------------------
export const useUserManagement = () => {
	const [userId, setUserId] = useState<string>("");
	const [userName, setUserName] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [users, setUsers] = useState<User[]>([]);

	const handleLoadUsers = useCallback(async (retryCount = 0) => {
		try {
			const loadedUsers = await loadUsers();
			setUsers(loadedUsers);
			setMessage("Users loaded successfully");
		} catch (error) {
			if (retryCount < 3) {
				// Retry up to 3 times
				setMessage("Loading users failed, retrying in 2 seconds...");
				setTimeout(() => handleLoadUsers(retryCount + 1), 2000); // Retry after 2 seconds
			} else {
				setMessage(`Error loading users: ${error}`);
			}
		}
	}, []);

	useEffect(() => {
		handleLoadUsers();
	}, [handleLoadUsers]);

	const handleCreateUser = async () => {
		try {
			const newUser = await createUser({ name: userName });
			setMessage(`User created with ID: ${newUser._id}`);
			setUserId(newUser._id || "");
			handleLoadUsers();
		} catch (error) {
			setMessage(`Error creating user: ${error}`);
		}
	};

	const handleGetUser = async () => {
		try {
			const user = await getUser(userId);
			setMessage(`Found user: ${JSON.stringify(user)}`);
		} catch (error) {
			setMessage(`Error getting user: ${error}`);
		}
	};

	const handleUpdateUser = async () => {
		try {
			const updatedUser = await updateUser(userId, { name: userName });
			setMessage(`Updated user: ${JSON.stringify(updatedUser)}`);
			handleLoadUsers();
		} catch (error) {
			setMessage(`Error updating user: ${error}`);
		}
	};

	const handleDeleteUser = async (id: string) => {
		try {
			await deleteUser(id);
			setMessage(`User deleted with ID: ${id}`);
			handleLoadUsers();
		} catch (error) {
			setMessage(`Error deleting user: ${error}`);
		}
	};

	return {
		userId,
		setUserId,
		userName,
		setUserName,
		message,
		users,
		handleCreateUser,
		handleGetUser,
		handleUpdateUser,
		handleDeleteUser,
		handleLoadUsers,
	};
};
