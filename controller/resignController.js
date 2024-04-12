import AuthUser from "../models/authModel.js";
import Resignation from "../models/resignationModel.js";


export const addResignation = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staff, reasons, resignDate, noticeDate} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        if(!staff || !reasons || !resignDate || !noticeDate){
            return res.status(403).json({
                success: false,
                message: 'All field are required!'
            })
        }

        const existResign = await Resignation.findOne({user: staff})

        if(existResign){
            return res.status(403).json({
                success: false,
                message: 'Staff already exist'
            })
        }

        const newResign = new Resignation({
            user: staff,
            reasons,
            noticeDate,
            resignDate,
        })

        await newResign.save()

        res.status(200).json({
            succes: true,
            message: 'Resignation successfull!',
            data: newResign
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const updateResignation  = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staff, reasons, resignDate, noticeDate} = req.body
        const {id} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        if(!staff || !reasons || !resignDate || !noticeDate){
            return res.status(403).json({
                success: false,
                message: 'All field are required!'
            })
        }

        const updateResign = await Resignation.findByIdAndUpdate({_id: id},{
            user: staff,
            reasons,
            noticeDate,
            resignDate
        },{new: true})

        if(!updateResign){
            return res.status(403).json({
                success: false,
                message: 'Resignation not found!'
            })
        }

        const resignation = await Resignation.find()

        res.status(200).json({
            success: true,
            message: 'Resignation updated successfully!',
            data: resignation
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getResignation = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const resignation = await Resignation.find().populate({
            path: 'user',
            select: 'firstName lastName email staffId department role profilePic'
        }).sort({createdAt: -1})

        res.status(200).json({
            succes: true,
            message: 'Resignation fetched successfully!',
            data: resignation
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}


export const deleteResignation = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const deleteResign = await Resignation.findByIdAndDelete(id)

        if(!deleteResign){
            return res.status(403).json({
                success: false, 
                message: 'Resignation not found!'
            })
        }

        const resignation = await Resignation.find()

        res.status(200).json({
            succes: true,
            message: 'Resignation deleted successfully!',
            data: resignation
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}