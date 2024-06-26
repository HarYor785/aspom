import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { leaveRequest, getUserRequest,
    getAllRequests, updateRequest, userLeaveBalance,
    getStaffsOnLeave} from '../controller/leaveController.js'


const router = express.Router()

router.post('/', authMiddleware, leaveRequest)
router.get('/user', authMiddleware, getUserRequest)
router.get('/', authMiddleware, getAllRequests)
router.put('/:requestId', authMiddleware, updateRequest)
router.get('/balance', authMiddleware, userLeaveBalance)
router.get('/staffs', authMiddleware, getStaffsOnLeave)


export default router
