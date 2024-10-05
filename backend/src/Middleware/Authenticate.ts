import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../Models/User";

const secret = process.env.JWT_PASS ?? "mfkdjpoefjefoefjecdcgcdgtisscyvhctyif";
// if (secret== undefined){
//   console.log("secret not found");

// }
interface DecodedToken {
	_id: string;
}

const Authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.cookies.authToken;

		if (!token) {
			return res.status(401).send("Unauthorized: No token provided");
		}

		const verifyToken = jwt.verify(token, secret) as DecodedToken;

		// find the user with the token
		const rootUser = await UserModel.findOne({
			_id: verifyToken._id,
		});

		if (!rootUser) {
			throw new Error("User not found");
		}

		// user info to request object
		req.user = rootUser;
		next();
	} catch (err) {
		res.status(401).send("Unauthorized: Token verification failed");
	}
};

export default Authenticate;
