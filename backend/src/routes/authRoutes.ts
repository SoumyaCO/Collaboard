require("dotenv").config();

import express, { Request, Response } from "express";
import UserModel, { User } from "../Models/User";
import { createUser } from "../Controllers/userController";
import { hash, registerValidation, loginValidation } from "../Controllers/validation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import nodemailer, { Transporter } from 'nodemailer';

import e from "express";
import { log } from "console";

// import * as dotenv from "dotenv";
// dotenv.config();

const router = express.Router();

const secret = process.env.JWT_PASS;

router.post('/register', async (req: Request, res: Response) => {

  // validate data before creating user
  const { error, value } = registerValidation(req.body);
  if (error) return res.send(error.details[0].message);

  // check if user already exists
  const emailExists = await UserModel.findOne({ email: req.body.email });
  if (emailExists) return res.send('Email already exists');

  // Hash password
  let hashPassword: string = "";
  let salt: string = "";
  await bcrypt.genSalt(10)
    .then(value => {
      salt = value
    }).catch(e => {
      console.log(e);
    })
  if (!req.body.password) {
    console.log("Pass not found");

  } else {
    await bcrypt.hash(req.body.password, salt)
      .then(value => {
        hashPassword = value;
      })
      .catch(e => {
        console.log(e);
      })
  }

  // Create user
  const newUser: User = {
    id: uuidv4(),
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPassword,
    createdAt: new Date(),
  };
  await createUser(newUser);

});

// login
router.post('/login', async (req: Request, res: Response) => {


  // validate data before creating user
  const { error, value } = loginValidation(req.body);
  if (error) return res.send(error.details[0].message);

  // check if user exists
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.send({
    message: 'Email does not exist',
  });

  // check password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({
    message: "Invalid Password"
  })

  if (!secret) {
    console.log("Not a secret");
  } else {
    // Create JWT token
    const token = jwt.sign({
      _id: user._id
    }, secret);
    res.header('auth-token', token).send(token);
  }
  // res.send({
  //   message: "Logged in"
  // })
});
let TOKEN: string = "";
router.post('/forgot-password', async (req, res) => {
  const email = req.body.email;
  const user: any = await UserModel.findOne({ email: email });
  if (!user) return res.status(404).send({
    msg: "User does not exist"
  });

  if (!secret) {
    console.log("Not a secret");
  } else {
    // Create JWT token
    TOKEN = jwt.sign({
      _id: user._id
    }, secret);
  }
  // using mailing service NodeMailer
  // Create a transporter object using the default SMTP transport
  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'skyhighyes@gmail.com',
      pass: 'gqgg iwfk iurj ovan',
    },
  });

  // Define the mail options
  const mailOptions = {
    from: 'skyhighyes@gmail.com',
    to: user.email,
    subject: 'Reset your password',
    text: `http://localhost:${process.env.PORT}/reset-password/${user._id}/${TOKEN}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      return res.send({
        msg: "Email sent"
      });
    }
  })
})

router.post('/reset-password/:id/:token', (req, res) => {
  const id = req.params.id;
  const token = req.params.token;

  if (!secret) return res.send({ msg: "Error with token" })
  else {
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        return res.json({ msg: "Token error" })
      } else {
        const hashPassword = hash(req.body.password);
        try {
          UserModel.findByIdAndUpdate({ _id: id }, { password: hashPassword })
          return res.send({ msg: "Password updated successfully" })
        } catch (e) {
          return res.send({ msg: e });
        }
      }
    })
  }
})



export default router;
