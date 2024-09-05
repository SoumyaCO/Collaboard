import mongoose from "mongoose";

export interface User {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	email: string;
	password: string;
	createdAt: Date;
}

const userSchema = new mongoose.Schema<User>({
	username: { type: String, required: true, unique: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	avatar: { type: String },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
});

/* Pre-save hook. Mongoose provides "pre" and "post" hooks/middlewares
 * For more info: "https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2"
 */
userSchema.pre("save", function (next) {
	if (!this.avatar) {
		this.avatar = `https://api.dicebear.com/9.x/lorelei/svg?seed=${this.username}`;
	}
	next();
});

const UserModel = mongoose.model<User>("User", userSchema);
export default UserModel;
