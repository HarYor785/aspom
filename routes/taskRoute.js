import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createTask, getAllTasks, getUserTaskStatistics,
  getUserTasks, updateTasks, updateTaskProgress, getAdminTasks } from '../controller/taskController.js'
import { uploadMiddleware } from '../utils/index.js'


const router = express.Router()
router.post('/', uploadMiddleware, authMiddleware, (req, res)=>{
    createTask(req, res, req.app.get('io'))
})
router.get('/user', authMiddleware, getUserTasks)
// router.get('/', authMiddleware, getAllTasks)
router.get('/staffs', authMiddleware, getAdminTasks)
router.put('/progress/:id', authMiddleware, updateTaskProgress)
router.get('/:month', authMiddleware, getUserTaskStatistics)
// router.put('/:id', authMiddleware, updateTasks)





export default router