import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { createPost, getPosts, likePost, commentPost, editPost,
    deletePost,
    getComments, } from "../controller/forumController.js"


const router = express.Router()

router.post('/', authMiddleware, createPost)
router.get('/', authMiddleware, getPosts)
router.post('/like/:postId', authMiddleware, likePost)
router.post('/comment/:postId', authMiddleware, commentPost)
router.get('/comment/:postId', authMiddleware, getComments)
router.put('/', authMiddleware, editPost)
router.delete('/:postId', authMiddleware, deletePost)


export default router