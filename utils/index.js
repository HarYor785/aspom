import bcryptjs from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import cron from "node-cron";
import { updateTasksStatistics } from '../controller/taskController.js';
import { updateReportStatistics } from '../controller/reportController.js';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/upload/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware for handling file uploads
export const uploadMiddleware = upload.single('upload');

export const hashPassword = async (val)=>{
    const salt = await bcryptjs.genSalt(10)
    const hashed = await bcryptjs.hashSync(val, salt)
    return hashed
}

export const comparePassword = async (value, defaultValue) =>{
    const compare = await bcryptjs.compare(value, defaultValue)
    return compare
}


export const assignJwt = (id, role)=>{
    return Jwt.sign({userId: id, role: role}, process.env.JWTTOKEN, {expiresIn: '1d'})
}

export const handleCronJobs = async (app)=>{

  // Emit event to update frontend
  const io = app.get('io');

 


}