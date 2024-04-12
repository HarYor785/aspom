import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createAppraisal, getAllAppraisal, 
    getUserAppraisal, getSingleUserAppraisal, 
    updateAppraisal } from '../controller/appraisalController.js'


const router = express.Router()

router.post('/', authMiddleware, createAppraisal)
router.get('/', authMiddleware, getAllAppraisal)
router.get('/user/:id', authMiddleware, getUserAppraisal)
router.get('/user', authMiddleware, getSingleUserAppraisal)
router.put('/:id', authMiddleware, updateAppraisal)


export default router