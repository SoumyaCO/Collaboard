import UserModel, { User } from "../Models/User";

export const createUser = async (userData: User) => {
    const user = new UserModel(userData);
    await user.save();
    return user;
}

export const deleteUser = async (userId: string) => {
    await UserModel.deleteOne({ userId });
}

export const updateUser = async (userId: string, updateData: User) => {
    const user = await UserModel.findOneAndUpdate({ userId }, updateData, { new: true });
    return user;
}

export const getUser = async (userId: string) => {
    const user = await UserModel.findOne({ userId });
    return user;
}
