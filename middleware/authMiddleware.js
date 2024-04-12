import Jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next)=>{
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(403).json({
            success: false,
            message: 'Authentication failed'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const verify = Jwt.verify(token, process.env.JWTTOKEN)

        req.body.user = {
            userId: verify.userId
        }

        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            success: false,
            message: 'Authorization failed'
        })
    }


}


export default authMiddleware