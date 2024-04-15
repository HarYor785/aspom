import express from 'express'
import { addLocation, getLocations } from '../controller/locationController.js'
import authMiddleware  from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, addLocation)
router.get('/', authMiddleware, getLocations)

export default router