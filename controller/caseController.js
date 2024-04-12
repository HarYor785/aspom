import AuthUser from "../models/authModel.js"
import Cases from "../models/caseModel.js"
import {v4 as uuidv4} from 'uuid'

const uuid = uuidv4()

export const submitCase = async (req, res) => {
    try {
        const {userId} = req.body.user
        const { issue, department} = req.body
        const caseId = uuid.slice(0, 6)

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const createCase = new Cases({
            user: userId,
            caseId,
            issue,
            department,
        })

        await createCase.save()

        res.status(200).json({
            success: true,
            message: 'Case submitted successfully!',
            data: createCase
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const updateCase = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const { issue, department, status} = req.body
        const {caseId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const existCase = await Cases.findById(caseId)

        if(!existCase){
            return res.status(401).json({
                success: false,
                messagee: 'Case not found!'
            })
        }

        let updatedCase;

        if(status){
            updatedCase = await Cases.findByIdAndUpdate(caseId,{
                status: status
            }, {new: true})
        }else{
            updatedCase = await Cases.findByIdAndUpdate(caseId,{
                issue, 
                department,
            }, {new: true})
        }

        res.status(200).json({
            success: true,
            message: 'Case updated succesfully!',
            data: updatedCase
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const UserCaseController = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const getCase = await Cases.find({user: userId}).sort({createdAt: -1})

        if(!getCase){
            return res.status(403).json({
                success: false,
                message: "You don't have any submitted case!"
            })
        }

        res.status(200).json({
            success: true,
            message: 'Case fetched successfully!',
            data: getCase
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const allCaseController = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const getCase = await Cases.find().populate({
            path: 'user',
            select: 'firstName lastName email'
        })

        if(!getCase){
            return res.status(403).json({
                success: false,
                message: "No cases found!"
            })
        }

        res.status(200).json({
            success: true,
            message: 'Case fetched successfully!',
            data: getCase
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}