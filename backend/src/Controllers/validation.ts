import UserModel, { User } from "../Models/User";
import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const registerValidation = (data: User) => {
  const schema = Joi.object({

    username: Joi.string()
      .min(6).required(),

    firstName: Joi.string()
      .min(2).required(),

    lastName: Joi.string()
      .min(2).required(),

    email: Joi.string()
      .min(6)
      .email().required(),

    password: Joi.string()
      .min(6).required(),

  });
  return schema.validate(data);
}

export const loginValidation = (data: User) => {
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

export default function (req: Request, res: Response, next: NextFunction){
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send({
      message: "Access denied"
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_PASS as string) as User;
    req.user = verified;
    next();
  } catch (error) {
    res.clearCookie('authToken');
    return res.redirect('/login');
  }
}