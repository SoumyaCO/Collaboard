import UserModel, { User } from "../Models/User";

export const createUser = async (userData: Partial<User>) => {
	const user = new UserModel(userData);

	await user
		.save()
		.then(() => {
			// don't need a "value" in place of () (* as we're not logging this)
			console.log("User Created");
		})
		.catch((err) => {
			console.log(err);
		});
};

export const deleteUser = async (username: string) => {
	try {
		const result = await UserModel.deleteOne({ username });
		return result.deletedCount;
	} catch (error) {
		console.log("Error deleting: ", error);
	}
};

export const updateUser = async (
	username: string,
	updateData: Partial<User>,
) => {
	const user = await UserModel.findOneAndUpdate({ username }, updateData, {
		new: true,
	});
	return user;
};

export const getUser = async (username: string) => {
	try {
		const user = await UserModel.findOne({ username: username });
		return user;
	} catch (error) {
		console.error("Error Querying for user");
	}
};
