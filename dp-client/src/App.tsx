import React from "react";
import { useUserManagement } from "./helper/useUserManagement";

// main app component
// ------------------
const App: React.FC = () => {
	const ctx = useUserManagement();

	return (
		<div>
			<h1>User Management</h1>
			<input
				type="text"
				value={ctx.userName}
				onChange={(e) => ctx.setUserName(e.target.value)}
				placeholder="User Name"
			/>
			<input type="text" value={ctx.userId} onChange={(e) => ctx.setUserId(e.target.value)} placeholder="User ID" />
			<button type="button" onClick={() => ctx.handleCreateUser()}>
				Create User
			</button>
			<button type="button" onClick={() => ctx.handleGetUser()}>
				Get User
			</button>
			<button type="button" onClick={() => ctx.handleUpdateUser()}>
				Update User
			</button>
			<button type="button" onClick={() => ctx.handleLoadUsers()}>
				Reload Users
			</button>
			<p>{ctx.message}</p>
			<h2>User List</h2>
			<ul>
				{ctx.users.map((user) => (
					<li key={user._id}>
						{user.name} (ID: {user._id})
						<button type="button" onClick={() => user._id && ctx.handleDeleteUser(user._id)}>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default App;
