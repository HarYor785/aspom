import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getAllReports, getReports, submitReport } from '../controller/reportController.js'
import { uploadMiddleware } from '../utils/index.js'

const router = express.Router()


router.post('/', uploadMiddleware, authMiddleware, (req, res)=>{
    submitReport(req, res, req.app.get('io'))
})
router.get('/user', authMiddleware, getReports)
router.get('/:month', authMiddleware, getAllReports)

export default router
