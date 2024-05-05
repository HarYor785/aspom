import AuthUser from "../models/authModel.js"
import Appraisal from "../models/appraisalModel.js"


export const createAppraisal = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { appraisal, achievement, innovation, } = req.body;

        // Validate if user exists
        const userExists = await AuthUser.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Authorization failed!'
            });
        }

        const existAppraisal = await Appraisal.findOne({user: userId})

        if(existAppraisal){
            return res.status(403).json({
                success: false,
                message: 'You already submitted an appraisal!'
            })
        }

        // Create a new appraisal instance
        const newAppraisal = new Appraisal({
            user: userId,
            appraisal,
            achievement,
            innovation,
            hrComment: '',
            mpComment: '',
        });

        // Save the new appraisal
        await newAppraisal.save();

        res.status(201).json({
            success: true,
            message: 'Appraisal submitted successfully',
            data: newAppraisal
        });
    } catch (error) {
        console.error('Error creating appraisal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllAppraisal = async (req, res) =>{
    try {
        const { userId } = req.body.user;

        // Validate if user exists
        const userExists = await AuthUser.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Authorization failed!'
            });
        }

        const appraisal = await Appraisal.find()
        .populate({
            path: 'user',
            select: 'firstName lastName email role department staffId profilePic createdAt'
        })

        res.status(200).json({
            success: true,
            message: 'Appraisal fetched succesfully!',
            data: appraisal
        })
    } catch (error) {
        console.error('Error creating appraisal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const getUserAppraisal = async (req, res) =>{
    try {
        const { userId } = req.body.user;
        const {id} = req.params

        // Validate if user exists
        const userExists = await AuthUser.findById(userId);
        if (!userExists) {
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            });
        }

        const appraisal = await Appraisal.findOne({_id: id})
        .populate({
            path: 'user',
            select: 'firstName lastName email role department staffId profilePic createdAt'
        })

        res.status(200).json({
            success: true,
            message: 'Appraisal fetched succesfully!',
            data: appraisal
        })
    } catch (error) {
        console.error('Error creating appraisal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const getSingleUserAppraisal = async (req, res) =>{
    try {
        const { userId } = req.body.user;

        // Validate if user exists
        const userExists = await AuthUser.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Authorization failed!'
            });
        }

        const appraisal = await Appraisal.findOne({user: userId})
        .populate({
            path: 'user',
            select: 'firstName lastName email role department staffId profilePic createdAt'
        })

        res.status(200).json({
            success: true,
            message: 'Appraisal fetched succesfully!',
            data: appraisal
        })
    } catch (error) {
        console.error('Error creating appraisal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const updateAppraisal = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { appraisal } = req.body;
        const { id } = req.params;

        // Validate if user exists
        const userExists = await AuthUser.findById(userId);
        if (!userExists) {
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            });
        }

        const existAppraisal = await Appraisal.findOne({_id: id})

        if(!existAppraisal){
            return res.status(403).json({
                success: false,
                message: 'Appraisal not found!'
            })
        }

        // Create a new appraisal instance
        const updateAppraisal = await Appraisal.findByIdAndUpdate({_id: id},{appraisal: appraisal},{new: true})

        if(!updateAppraisal){
            return res.status(403).json({
                success: false,
                message: "There's an error updating appraisal!"
            })
        }

        res.status(200).json({
            success: true,
            message: 'Appraisal Updated successfully!',
            data: updateAppraisal
        });
    } catch (error) {
        console.error('Error creating appraisal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};