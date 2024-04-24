import LeaveRequest from "../models/leaveRequest.js";
import LeaveBalance from "../models/leaveBalance.js";
import AuthUser from "../models/authModel.js"
import {sendLeaveNotification} from '../utils/mailer.js'
/* ********************** *\
|LEAVE REQUEST
\* ********************** */ 
// SUBMIT LEAVE REQUEST

export const leaveRequest = async (req, res) => {
    try{
        const {userId} = req.body.user
        const {startDate, endDate, days, leaveType, reason} = req.body
        if(!startDate || !endDate || !days || !leaveType || !reason){
            return res.status(401).json({
                success: false,
                message: 'All fields are required'
            })
        }

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }
        const createdAtDate = new Date(user.joinDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 6);

        if (leaveType === 'Annual Leave' && createdAtDate > threeMonthsAgo) {
            return res.status(403).json({
                success: false,
                message: `You are not allowed to apply for Annual Leave request within 
                the first six months of joining the company. Please reach 
                out to HR for further assistance.`
            });
        }

        let balance = await LeaveBalance.findOne({user: userId})

        if(!balance){
            balance = new LeaveBalance({
                user: userId
            })

            await balance.save()
        }

        if ((leaveType === 'Annual Leave' && balance.annualLeave < days) ||
            (leaveType === 'Casual Leave' && balance.casualLeave < days)) {
            return res.status(402).json({
                success: false,
                message: `You don't have enough ${leaveType} balance.`
            });
        }

        const request = new LeaveRequest({
            user: userId,
            startDate,
            endDate,
            days,
            leaveType,
            reason
        })

        await request.save()

        const supervisor = await AuthUser.findOne({
            department: user.department,
            role: 'Supervisor'
        })

        if(supervisor){
            await sendLeaveNotification(supervisor.email, user, res, 'Supervisor', true)
        }

        // res.status(200).json({
        //     success: true,
        //     message: 'Leave request submitted successfully!',
        //     data: request
        // })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// GET USER REQUESTS
export const getUserRequest = async (req, res) => {
    try{
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const request = await LeaveRequest.find({user: userId})
        .populate("user", "firstName lastName")
        .sort({createdAt: -1})

        res.status(200).json({
            success: true,
            message: 'Request fetch successfully!',
            data: request
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// GET ALL REQUESTS
export const getAllRequests = async (req, res) => {
    try{
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const request = await LeaveRequest.find()
        .populate({
            path: 'user',
            select: 'firstName lastName staffId email department role profilePic'
        }).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            message: 'All Requests fetch successfully!',
            data: request
        })
        
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// UPDATE REQUESTS
export const  updateRequest = async (req, res) =>{
    try{
        const {requestId} = req.params
        const {status, name, startDate, endDate, days, leaveType, reason} = req.body;
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const existRequest = await LeaveRequest.findById(requestId)
        
        if (!existRequest) {
            return res.status(401).json({ 
                success: false, 
                message: 'Leave request not found' 
            });
        }
        
        const requestOwner = await AuthUser.findById(existRequest.user)

        let approval;
        switch(user.role){
            case "Supervisor":
                if (user.role === 'Supervisor' && user.department === requestOwner.department) {
                    approval = "uhApproval";
                }
            case "HR":
                approval = "hrApproval";
                break;
            case "Administrator":
                approval = "adminApproval";
                break;
            default :
                //checking the authorized user is the same as the owner of this request
                if (String(existRequest.user) !== String(userId)) {
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized access"
                    });
                }
                const updateFields = { name, startDate, endDate, days, leaveType, reason };
                const updatedRequest = await LeaveRequest.findOneAndUpdate({ user: userId }, updateFields, { new: true });
                return res.status(200).json({ 
                    success: true, 
                    message: 'Request Updated Successfully!',
                    data: updatedRequest,
                });
        }

        if(!['Approved', 'Pending', 'Rejected'].includes(status)){
            return res.status(401).json({
                success: false,
                message: 'Invalid approval status!'
            })
        }

        const update = {[approval]: status}
        const option = {new: true}

        const approveRequest = await LeaveRequest.findByIdAndUpdate({_id: requestId},update, option)

        if(approval === 'administratorApproval'){
            let balance = await LeaveBalance.findOne({user: approveRequest.user})

            if(!balance){
                balance = new LeaveBalance({
                    user: approveRequest.user,
                    annualLeave: approveRequest.leaveType === 'Annual Leave' ? parseInt(days) - 20 : 20 ,
                    casualLeave: approveRequest.leaveType === 'Casual Leave' ? parseInt(days) - 5 : 5 ,
                })

                await balance.save()
            }else{
                await LeaveBalance.findByIdAndUpdate({_id: balance._id},{
                    user: approveRequest.user,
                    annualLeave: approveRequest.leaveType === 'Annual Leave' ? parseInt(days) - 20 : 20 ,
                    casualLeave: approveRequest.leaveType === 'Casual Leave' ? parseInt(days) - 5 : 5 ,
                })
            }
        }

        // let findNextApproval;
        // if(approval === 'uhApproval'){
        //     findNextApproval = await AuthUser.findOne({
        //         department: 'HR',
        //         role: 'Supervisor'
        //     })

        //     await sendLeaveNotification(findNextApproval.email, existRequest, res)
        // }else if(approval === 'hrApproval'){
        //     findNextApproval = await AuthUser.findOne({
        //         role: 'Administrator'
        //     })

        //     await sendLeaveNotification(findNextApproval.email, existRequest, res)
        // }

        // Send email notifications based on the role approving the leave

        const leaveUser = await AuthUser.findById(approveRequest.user)
        switch (approval) {
            case "uhApproval":
                if (status === "Approved") {
                    // Find HR supervisor and send email
                    const hrSupervisor = await AuthUser.findOne({
                        department: 'HR',
                        role: 'Supervisor'
                    });
                    if (hrSupervisor) {
                        await sendLeaveNotification(hrSupervisor.email, leaveUser, res, 'HR', false);
                    }
                }
                break;
            case "hrApproval":
                if (status === "Approved") {
                    // Find Administrator and send email
                    const admin = await AuthUser.findOne({ role: 'Administrator' });
                    if (admin) {
                        await sendLeaveNotification(admin.email, leaveUser, res, 'admin', false);
                    }
                }
                break;
            case "adminApproval":
                if (status === "Approved") {
                    // Send email to user who owns the leave request
                    // const user = await AuthUser.findById(approveRequest.user);
                    if (user) {
                        await sendLeaveNotification(leaveUser.email, leaveUser, res, 'self', false);
                    }
                }
                break;
            default:
                break;
        }

        // res.status(200).json({
        //     success: true,
        //     message: 'Status Updated sucessfully!',
        //     data: approveRequest
        // })
        
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const userLeaveBalance = async (req, res) => {
    try{
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const balance = await LeaveBalance.find({user: userId})

        if(!balance){
            res.status(403).json({
                success: false,
                message: 'No leave balance found!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Leave Balance fetched!',
            data: balance
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

/* ********************** *\
|END OF LEAVE REQUEST CONTROLLER
\* ********************** */ 