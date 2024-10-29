import { Request, Response } from 'express';
import { uploadOnCloudinary } from './cloudinary.service';

async function handleImageUpload(req: Request, res: Response): Promise<string | undefined> {
	let imageUrl: string | undefined;

	// Check if the 'photo' field exists in the uploaded files
	if (req.files && (req.files as { photo?: Express.Multer.File[] }).photo) {
		try {
			// Get the local file path
			const localFilePath = (req.files as { photo: Express.Multer.File[] }).photo[0].path;
			console.log("file path from server: ", localFilePath);

			// Upload the file to Cloudinary and get the URL
			imageUrl = await uploadOnCloudinary(localFilePath);
			console.log('File uploaded successfully!');
		} catch (err) {
			// Respond with an error if upload fails
			res.status(500).json({
				msg: 'File upload failed.',
				error: err,
			});
		}
	}

	return imageUrl;
}

export default handleImageUpload;
