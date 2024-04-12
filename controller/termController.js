import AuthUser from "../models/authModel.js";
import Termination from "../models/terminationModel.js";


export const addTermination = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {staff, type, noticeDate, terminationDate, reasons} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        if(!staff || !type || !noticeDate || !terminationDate || !reasons ){
            return res.status(403).json({
                success: false,
                message: 'All fields are required!'
            })
        }

        const existStaff = await Termination.findOne({user: staff})
        if(existStaff){
            return res.status(401).json({
                success: false,
                message: 'Staff already added'
            })
        }

        const newTermination = new Termination({
            user: staff,
            type,
            noticeDate,
            terminationDate,
            reasons
        })

        await newTermination.save()

        const termination = await Termination.find()

        res.status(200).json({
            success: true,
            message: 'Termination saved successfully',
            data: termination
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}


export const updateTermination = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staff, type, noticeDate, terminationDate, reasons} = req.body
        const {id} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        if(!staff || !type || !noticeDate || !terminationDate || !reasons ){
            return res.status(403).json({
                success: false,
                message: 'All fields are required!'
            })
        }

        const updateTermination = await Termination.findByIdAndUpdate({_id: id},{
            user: staff,
            type,
            noticeDate,
            terminationDate,
            reasons
        },{new: true})

        if(!updateTermination){
            return res.status(403).json({
                success: false,
                message: 'Termination not found!'
            })
        }

        const termination = await Termination.find()

        res.status(200).json({
            success: true,
            message: 'Termination updated succesfully!',
            data: termination
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}


export const deleteTermination = async (req, res) => {
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

        const updateTermination = await Termination.findByIdAndDelete(id)

        if(!updateTermination){
            return res.status(403).json({
                success: false,
                message: 'Termination not found!'
            })
        }

        const termination = await Termination.find()

        res.status(200).json({
            success: true,
            message: 'Termination deleted succesfully!',
            data: termination
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getTerminations = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const termination = await Termination.find().populate({
            path: 'user',
            select: 'firstName lastName email department role staffId'
        })

        res.status(200).json({
            success: true,
            message: 'Termination fetched succesfully!',
            data: termination
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}