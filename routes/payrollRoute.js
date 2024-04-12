import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addPayroll, deletePayroll, getPayrolls, getSinglePayroll, updatePayroll } from '../controller/payrollController.js'


const router = express.Router()

router.post('/', authMiddleware, addPayroll)
router.put('/:id', authMiddleware, updatePayroll)
router.get('/:id', authMiddleware, getSinglePayroll)
router.get('/', authMiddleware, getPayrolls)
router.delete('/:id', authMiddleware, deletePayroll)

export default router