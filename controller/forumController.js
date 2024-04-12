import Forum from "../models/forumModel.js"
import Comment from "../models/commentModel.js"
import AuthUser from "../models/authModel.js"


/* ********************** *\
|FORUM POSTS
\* ********************** */ 
// CREATE POST
export const createPost = async (req, res) => {
    try{
        const {userId} = req.body.user
        const {description} = req.body

        if(!description){
            return res.status(401).json({
                success: false,
                message:"Please provide a description for the post."
            })
        }

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const post = new Forum({
            user: userId,
            description
        })

        await post.save()

        const allPosts = await Forum.find()

        res.status(200).json({
            success: true,
            message: 'Post created successfully!',
            data: allPosts
        })
        
    }catch(error){
        console.log(error)
        res.status(401).json({
            success: true,
            message: 'Internal server error!'
        })
    }
}

// FETCH ALL POSTS
export const getPosts = async (req, res) => {
    try{
        const {userId} = req.body.user
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const posts = await Forum.find()
        .populate({path: 'comment'})
        .populate({path: 'user', select: 'firstName lastName profilePic department'})
        .sort({createdAt: -1})

        res.status(200).json({
            success: true,
            message: 'Posts fetch successfully!',
            data: posts
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

// LIKE POST
export const likePost = async (req, res) =>{
    try{
        const {userId} = req.body.user
        const {postId} = req.params
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const findPost = await Forum.findById(postId)

        if(!findPost){
            return res.status(401).json({
                success: false,
                message: 'No post found!'
            })
        }
        
        const findIndex = findPost.likes.findIndex((i)=> i === String(userId))

        if(findIndex === -1){
            findPost.likes.push(String(userId));
        }else{
            findPost.likes.splice(findIndex, 1);
        }
        
        const updatedPost = await Forum.findByIdAndUpdate(postId, findPost, {new: true})

        //send notification to the owner of the post 
        // let payload={
        //     sender : user._id ,
        //     reciever : findPost.author ,
        //     type : "like", 
        //     post : findPost._id
        // }
        // socketIoServer.emit("newNotification" ,payload )
        const getPost = await Forum.findById(postId).populate('comment')

        return res.status(200).json({
            success: true,
            message: 'You like this post!',
            data: getPost
        })


    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
} 

// COMMENT POST
export const commentPost = async (req, res) =>{
    try{
        const {userId} = req.body.user
        const {comment} = req.body
        const {postId} = req.params
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const findPost = await Forum.findById(postId)

        if(!findPost){
            return res.status(401).json({
                success: false,
                message: 'No post found!'
            })
        }

        const createComment = await Comment.create({
            user: userId,
            postId,
            comment: comment,
            from: userId,
        })

        findPost.comment.push(createComment._id)

        await findPost.save()

        const findComment = await Comment.find({postId: postId}).populate({
            path: 'user',
            select: 'firstName lastName staffId role profilePic department'
        }).sort({createdAt: -1})
        
        res.status(201).json({
            success: true,
            message: 'You comment on this post!',
            data: findComment
        })
        
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

// EDIT POST
export const editPost = async (req, res) =>{
    try{
        const {userId} = req.body.user
        const {description, postId} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        let findPost = await Forum.findById(postId)
        
        if(!findPost){
            return res.status(401).json({
                success: false,
                message: 'No post found!'
            })
        }

        if(findPost.user != userId){
            return res.status(401).json({
                success: false,
                message: "You don't have permission to perform this action!"
            })
        }

        const updatePost = await Forum.findByIdAndUpdate({_id: postId},{
            description
        },{new:true})

        const getPosts = await Forum.find().populate('comment')

        res.status(200).json({
            success: true,
            message: 'Post updated successfully!',
            data: getPosts,
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

// DELETE POST
export const deletePost = async (req, res) => {
    try{
        const {userId} = req.body.user
        const {postId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        let findPost = await Forum.findById(postId)
        
        if(!findPost){
            return res.status(401).json({
                success: false,
                message: 'No post found!'
            })
        }
        if(String(userId) !== String(findPost.user)){
            return res.status(403).json({
                success: false,
                message: "You don't have permission to perform this action!"
            })
        }

        const deletePost = await Forum.findByIdAndDelete(postId)
        // check if the owner of this post is deleting it 

        const getPosts = await Forum.find()
        .populate({path: 'comment'})
        .populate({path: 'user', select: 'firstName lastName profilePic department'})

        res.status(200).json({
            success: true,
            message: 'Poof! Your post has been deleted!',
            data: getPosts,
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getComments = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {postId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const findComment = await Comment.find({postId: postId}).populate({
            path: 'user',
            select: 'firstName lastName staffId role profilePic department'
        }).sort({createdAt: -1})
        
        if(!findComment){
            return res.status(401).json({
                success: false,
                message: 'No Comment found!',
                data: []
            })
        }

        res.status(200).json({
            success: true,
            message: 'Comment fetched successfully!',
            data: findComment,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

/* ********************** *\
|END OF FORUM POST CONTROLLER
\* ********************** */ 