import UserModel, { User } from "../Models/User";
import * as Joi from 'joi';
import bcrypt from 'bcryptjs';
export const registerValidation = (data: User)=>{
  const schema = Joi.object({
    
    username: Joi.string()
    .min(6),

    firstName: Joi.string()
    .min(2),

    lastName: Joi.string()
    .min(2),
  
    email: Joi.string()
    .min(6)
    .email(),
  
    password: Joi.string()
    .min(6),
  });
  return schema.validate(data);
}

export const loginValidation = (data: User)=>{
  const schema = Joi.object({
    email: Joi.string()
    .min(6)
    .required()
    .email(),
  
    password: Joi.string()
    .required()
  
  }); 
  return schema.validate(data);

}

export const hash =  async(password: string)=>{
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}