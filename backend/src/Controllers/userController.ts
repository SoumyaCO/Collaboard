import UserModel, { User } from "../Models/User";
import { Request, Response } from 'express';
import handleImageUpload from "../utils/uploadImage";

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

export const updateUser = async (req: Request, res: Response) => {
	const username = req.params.username;

	try {
		// Call handleImageUpload to get the image URL from Cloudinary
		const imageUrl = await handleImageUpload(req, res);

		// ** slight problem, we need to validate data before parsing it **
		const updateData: Partial<User> = {
			...req.body, // spread operator to include other fields from the request body
			...(imageUrl && { avatar: imageUrl }) // Set avatar if imageUrl exists
		};

		// Find the user and update with new data
		const user = await UserModel.findOneAndUpdate({ username }, updateData, {
			new: true,
		});

		if (!user) {
			return res.status(404).json({ msg: 'User not found.' });
		}
		return res.status(200).json({ msg: "User Updated", data: user });
	} catch (err) {
		// Handle errors
		return res.status(500).json({ msg: `Internal Error: ${err}`, data: undefined });
	}
};

export const getUser = async (username: string) => {
	try {
		const user = await UserModel.findOne({ username: username });
		return user;
	} catch (error) {
		console.error("Error Querying for user");
	}
};
