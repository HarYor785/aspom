import express from 'express'
import { clockIn, clockOut, allAttendance } from '../controller/attendanceController.js'
import authMiddleware from '../middleware/authMiddleware.js'


const router = express.Router()

router.post('/clock-in', authMiddleware, clockIn)
router.post('/clock-out', authMiddleware, clockOut)
router.get('/', authMiddleware, allAttendance)

export default router