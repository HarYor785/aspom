import express from 'express'
import { addLocation, getLocations, deleteLocation, updateLocation } from '../controller/locationController.js'
import authMiddleware  from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, addLocation)
router.get('/', authMiddleware, getLocations)
router.delete('/:id', authMiddleware, deleteLocation)
router.put('/:id', authMiddleware, updateLocation)

export default router