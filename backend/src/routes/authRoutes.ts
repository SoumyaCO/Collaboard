require("dotenv").config()

import express, { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import nodemailer, { Transporter } from "nodemailer"

import UserModel, { User } from "../Models/User"
import { createUser } from "../Controllers/userController"
import Authenticate from "../Middleware/Authenticate"
import { registerValidation, loginValidation } from "../Controllers/validation"
import { upload } from "../Middleware/multer.middleware"
import { uploadOnCloudinary } from "../Middleware/cloudinary.service"

const router = express.Router()

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

const secret = process.env.JWT_PASS

/* -- Note for frontend --
  Make sure the form has 'enctype' attribute set to 'multipart/form-data'  
  Make the 'name' attribute of the profile picture upload field set to 'avatar'
*/

router.post(
    "/register",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    async (req: Request, res: Response) => {
        // Optional image upload logic
        let imageUrl: string | undefined
        if (
            req.files &&
            (req.files as { photo?: Express.Multer.File[] }).photo
        ) {
            try {
                const localFilePath = (
                    req.files as { photo: Express.Multer.File[] }
                ).photo[0].path
                console.log("file path from server: ", localFilePath)
                imageUrl = await uploadOnCloudinary(localFilePath)
                console.log("File uploaded successfully!")
            } catch (err) {
                return res.status(500).json({
                    msg: "File upload failed.",
                    error: err,
                })
            }
        }

        // validate data before creating user
        const { error, value } = registerValidation(req.body)
        if (error)
            return res
                .status(400)
                .send({
                    message: "Validation failed",
                    error: error.details[0].message,
                })

        // check if user already exists
        const emailExists = await UserModel.findOne({ email: req.body.email })
        if (emailExists)
            return res.status(409).send({ message: "Email already exists" })

        // Hash password
        let hashPassword: string = ""
        let salt: string = ""
        await bcrypt
            .genSalt(10)
            .then((value) => {
                salt = value
            })
            .catch((e) => {
                console.log(e)
            })
        if (!req.body.password) {
            console.log("Pass not found")
        } else {
            await bcrypt
                .hash(req.body.password, salt)
                .then((value) => {
                    hashPassword = value
                })
                .catch((e) => {
                    console.log(e)
                })
        }

        /*
         * Usring "Partial<Type> to make fields optional"
         */
        const newUser: Partial<User> = {
            id: uuidv4(),
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashPassword,
        }
        await createUser(newUser)
            .then(() => res.status(201).send({ message: "user created" }))
            .catch((err) =>
                res.status(500).send({
                    message: "An error occurred while saving the user",
                    error: err,
                })
            )
    }
)

// login
router.post("/login", async (req: Request, res: Response) => {
    // validate data before creating user
    const { error, value } = loginValidation(req.body)
    if (error)
        return res
            .status(400)
            .send({
                message: "Validation failed",
                error: error.details[0].message,
            })

    // check if user exists
    const user = await UserModel.findOne({ email: req.body.email })
    if (!user)
        return res.status(401).send({
            message: "Invalid credentials",
        })

    // check password
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if (!validPass)
        return res.status(401).send({
            message: "Invalid credentials",
        })

  if (!secret) {
    console.log("Not a secret");
  } else {
    // Create JWT token
    const token: String = jwt.sign({ _id: user._id }, secret);
    res
      .status(200)
      .cookie("authToken", token, {
        sameSite: "none",
        secure: true,
        partitioned: true,
        httpOnly: true,
        maxAge: 3600000,
        domain: ".gooddevs.org",
        path: "/"
      })
      .send({ message: "login sucessful" });
  }
});
let TOKEN: string = "";

router.post("/forgot-password", async (req, res) => {
    const email = req.body.email
    const user: User | null = await UserModel.findOne({ email: email })
    if (!user)
        return res.status(401).send({
            message: "Invalid credentials",
        })

    if (!secret) {
        console.log("Not a secret")
    } else {
        // Create JWT token
        TOKEN = jwt.sign(
            {
                _id: user.id,
            },
            secret
        )
    }
    // using mailing service NodeMailer
    // Create a transporter object using the default SMTP transport
    const transporter: Transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "skyhighyes@gmail.com",
            pass: "gqgg iwfk iurj ovan",
        },
    })

    // Define the mail options
    const mailOptions = {
        from: "skyhighyes@gmail.com",
        to: user.email,
        subject: "Reset your password",
        text: `http://localhost:${process.env.PORT}/auth/reset-password/${user.id}/${TOKEN}`,
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            return res.status(200).send({
                message: "Email sent",
            })
        }
    })
})

router.post("/reset-password/:id/:token", (req, res) => {
    const id = req.params.id
    const token = req.params.token

    if (!secret)
        return res.status(401).send({ message: "Invalid or expired token" })
    else {
        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                return res
                    .status(401)
                    .send({ message: "Invalid or expired token" })
            } else {
                // Hash password
                let hashPassword: string = ""
                let salt: string = ""
                await bcrypt
                    .genSalt(10)
                    .then((value) => {
                        salt = value
                    })
                    .catch((e) => {
                        console.log(e)
                    })
                if (!req.body.password) {
                    console.log("Pass not found")
                } else {
                    await bcrypt
                        .hash(req.body.password, salt)
                        .then((value) => {
                            hashPassword = value
                        })
                        .catch((e) => {
                            console.log(e)
                        })
                }
                try {
                    const user = await UserModel.findById(id)
                    if (!user)
                        return res
                            .status(401)
                            .send({ message: "Invalid credentials" })
                    user.password = hashPassword
                    await user.save()
                    return res
                        .status(200)
                        .send({ message: "Password updated successfully" })
                } catch (e) {
                    return res.status(500).send({
                        message: "An error occurred while saving the user",
                        error: e,
                    })
                }
            }
        })
    }
})

// User profile
router.get("/profile", Authenticate, (req, res) => {
    res.send(req.user)
})

// User data for home page  and other
router.get("/getdata", Authenticate, (req, res) => {
    res.send(req.user)
})

// logout route
router.get("/logout", (req, res) => {
    res.clearCookie("authToken", { path: "/" })
    res.status(200).send("User logged out successfully")
})

export default router
