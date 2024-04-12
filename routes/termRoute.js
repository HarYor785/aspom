import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addTermination, getTerminations, updateTermination } from '../controller/termController.js'


const router = express.Router()


router.post('/', authMiddleware, addTermination)
router.get('/', authMiddleware, getTerminations)
router.put('/:id', authMiddleware, updateTermination)
router.delete('/:id', authMiddleware, updateTermination)

export default router