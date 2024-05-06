import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { UserCaseController, allCaseController, submitCase, updateCase } from "../controller/caseController.js"
import { uploadMiddleware } from '../utils/index.js'

const router = express.Router()

router.post('/',uploadMiddleware, authMiddleware, submitCase)
router.put('/:caseId', authMiddleware, updateCase)
router.get('/user', authMiddleware, UserCaseController)
router.get('/', authMiddleware, allCaseController)


export default router