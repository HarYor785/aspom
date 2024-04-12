import Department from '../models/departmentModel.js'
import AuthUser from '../models/authModel.js'

export const createDept = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {name, head} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const department = new Department({
            name,
            head,
        })

        await department.save()

        res.status(200).json({
            success: true,
            message: 'Department added successfully',
            data: department
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const updateDept = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {name, head} = req.body
        const {deptId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const update = await Department.findByIdAndUpdate({_id: deptId},{
            name, head
        },{new: true})

        if(!update){
            return res.status(403).json({
                success: false,
                message: "No such department found!"
            })
        }

        res.status(200).json({
            success: true,
            message: 'Department updated successfully!',
            data: update
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const deleteDept = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {deptId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const department = await Department.findByIdAndDelete(deptId)

        if(!department){
            return res.status(401).json({
                success: false,
                message: 'Department not found'
            })
        }

        const allDept = await department.find()

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully!',
            data: allDept
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getDepts = async ( req, res, next ) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        // const departments = await Department.find().populate({
        //     path: 'head',
        //     select: 'firstName lastName'
        // }).sort({createdAt: -1})

        const departments = await Department.aggregate([
            {
                $lookup: {
                    from: 'authusers',
                    localField: 'head',
                    foreignField: '_id',
                    as: 'head'
                }
            },
            {
                $addFields: {
                    total: { $size: '$head' } // Calculate the total number of users in the department
                }
            },
            {
                $project: {
                    name: 1,
                    head: {
                        $arrayElemAt: [
                            {
                                $map: {
                                    input: '$head',
                                    as: 'user',
                                    in: {
                                        firstName: '$$user.firstName',
                                        lastName: '$$user.lastName'
                                    }
                                }
                            },
                            0
                        ]
                    },
                    total: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Department list retrieved successfully!',
            data: departments
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}