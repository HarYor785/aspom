import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { createChat, sendMessage, fetchUserChat,
    fetchMessages, updateMessageStatus } from "../controller/chatController.js"
import {uploadMiddleware} from '../utils/index.js'


const router = express.Router()

router.post('/', authMiddleware, createChat)
router.post('/message', uploadMiddleware, authMiddleware, sendMessage)
router.get('/user', authMiddleware, fetchUserChat)
router.get('/messages/:chatId', authMiddleware, fetchMessages)
router.put('/messages/:chatId', authMiddleware, updateMessageStatus)


export default router