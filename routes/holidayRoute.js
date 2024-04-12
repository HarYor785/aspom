import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import { createHoliday, deleteHoliday, 
    updateHoliday, getAllHolidays } from '../controller/holidayController.js';


const router = express.Router()

// Route to create a new holiday
router.post('/', authMiddleware, createHoliday);

// Route to get all holidays
router.get('/', authMiddleware, getAllHolidays);

// Route to update a holiday by ID
router.put('/:id', authMiddleware, updateHoliday);

// Route to delete a holiday by ID
router.delete('/:id', deleteHoliday, deleteHoliday);

export default router