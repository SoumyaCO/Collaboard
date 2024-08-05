"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../Models/User"));
const userController_1 = require("../Controllers/userController");
const validation_1 = require("../Controllers/validation");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
// import * as dotenv from "dotenv";
// dotenv.config();
const router = express_1.default.Router();
const secret = process.env.JWT_PASS;
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate data before creating user
    const { error, value } = (0, validation_1.registerValidation)(req.body);
    if (error)
        return res.send(error.details[0].message);
    // check if user already exists
    const emailExists = yield User_1.default.findOne({ email: req.body.email });
    if (emailExists)
        return res.send('Email already exists');
    // Hash password
    let hashPassword = "";
    const salt = yield bcryptjs_1.default.genSalt(10);
    try {
        hashPassword = yield bcryptjs_1.default.hash(req.body.password, salt);
    }
    catch (err) {
        console.log(err);
    }
    // Create user
    const newUser = {
        id: (0, uuid_1.v4)(),
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPassword,
        createdAt: new Date(),
    };
    try {
        (0, userController_1.createUser)(newUser);
        res.send({
            message: "User created"
        });
    }
    catch (err) {
        res.status(502).send(err);
    }
}));
// login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate data before creating user
    const { error, value } = (0, validation_1.loginValidation)(req.body);
    if (error)
        return res.send(error.details[0].message);
    // check if user exists
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (!user)
        return res.send({
            message: 'Email does not exist',
        });
    // check password
    const validPass = yield bcryptjs_1.default.compare(req.body.password, user.password);
    if (!validPass)
        return res.status(400).send({
            message: "Invalid Password"
        });
    if (!secret) {
        console.log("Not a secret");
    }
    else {
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: user._id
        }, secret);
        res.header('auth-token', token).send(token);
    }
    // res.send({
    //   message: "Logged in"
    // })
}));
let TOKEN = "";
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield User_1.default.findOne({ email: email });
    if (!user)
        return res.status(404).send({
            msg: "User does not exist"
        });
    if (!secret) {
        console.log("Not a secret");
    }
    else {
        // Create JWT token
        TOKEN = jsonwebtoken_1.default.sign({
            _id: user._id
        }, secret);
    }
    // using mailing service NodeMailer
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer_1.default.createTransport({
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
        }
        else {
            return res.send({
                msg: "Email sent"
            });
        }
    });
}));
router.post('/reset-password/:id/:token', (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    if (!secret)
        return res.send({ msg: "Error with token" });
    else {
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.json({ msg: "Token error" });
            }
            else {
                const hashPassword = (0, validation_1.hash)(req.body.password);
                try {
                    User_1.default.findByIdAndUpdate({ _id: id }, { password: hashPassword });
                    return res.send({ msg: "Password updated successfully" });
                }
                catch (e) {
                    return res.send({ msg: e });
                }
            }
        }));
    }
});
exports.default = router;
