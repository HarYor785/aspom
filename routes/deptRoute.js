import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createDept, deleteDept, getDepts, updateDept } from '../controller/deptController.js'


const router = express.Router()

router.post('/', authMiddleware, createDept)
router.put('/:deptId', authMiddleware, updateDept)
router.get('/', authMiddleware, getDepts)
router.delete('/:deptId', authMiddleware, deleteDept)

export default router