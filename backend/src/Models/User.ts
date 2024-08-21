import mongoose from 'mongoose'

export interface User {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    createdAt: Date,
}
declare global 
{
    namespace Express 
    {
      interface Request 
      {
        user?: User;
      }
    }
  }
const userSchema = new mongoose.Schema<User>({
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const UserModel = mongoose.model<User>('User', userSchema);
export default UserModel;
