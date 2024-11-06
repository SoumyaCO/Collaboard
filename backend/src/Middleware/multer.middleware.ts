import multer, { StorageEngine } from 'multer';
import { Request } from 'express';


const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, __dirname+'/../../uploads');
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    console.log("File name from multer: ", uniqueSuffix);
    
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

export const upload = multer({ storage: storage });


