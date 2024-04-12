import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { UserCaseController, allCaseController, submitCase, updateCase } from "../controller/caseController.js"


const router = express.Router()

router.post('/', authMiddleware, submitCase)
router.put('/:caseId', authMiddleware, updateCase)
router.get('/user', authMiddleware, UserCaseController)
router.get('/', authMiddleware, allCaseController)


export default router