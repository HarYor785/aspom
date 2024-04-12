import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addResignation, deleteResignation, getResignation, updateResignation } from '../controller/resignController.js';


const router = express.Router()

router.post('/', authMiddleware, addResignation)
router.get('/', authMiddleware, getResignation)
router.put('/:id', authMiddleware, updateResignation)
router.delete('/:id', authMiddleware, deleteResignation)

export default router