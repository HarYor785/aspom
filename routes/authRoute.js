import express from 'express'
import { getAcounts, getAllUsers, getUser, 
    loginAuth, signupAuth, addStaff,
    updateProfile, verifyAccount,
    forgotPassword, passwordResetLink, 
    resetPassword, changePassword} from '../controller/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { uploadMiddleware } from '../utils/index.js'


const router = express.Router()

router.post('/signup', signupAuth)
router.post('/verification/:id/:code', verifyAccount)
router.post('/login', loginAuth)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:id', resetPassword)
router.get('/password-link/:id/:token', passwordResetLink)


router.put('/change-password',authMiddleware, changePassword)
router.put('/update/:id', uploadMiddleware, authMiddleware, updateProfile)
router.get('/accounts', authMiddleware, getAcounts)
router.get('/users', authMiddleware, getAllUsers)
router.get('/account', authMiddleware, getUser)
router.get('/account/:id', authMiddleware, getUser)

// HR
router.post('/add-employee', authMiddleware, addStaff)

// router.get('/', emailLogin)
// router.get('/callback', googleAuth)
// router.get('/mail/:accessToken', authMiddleware, fetchMailMessages)



export default router