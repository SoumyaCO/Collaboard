import UserModel, { User } from "../Models/User";

export const createUser = async (userData: User) => {
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

export const deleteUser = async (userId: string) => {
	await UserModel.deleteOne({ userId });
};

export const updateUser = async (userId: string, updateData: User) => {
	const user = await UserModel.findOneAndUpdate({ userId }, updateData, {
		new: true,
	});
	return user;
};

export const getUser = async (email: string) => {
	try {
		const user = await UserModel.findOne({ email: email });
		return user;
	} catch (error) {
		console.error("Error Querying for user");
	}
};
