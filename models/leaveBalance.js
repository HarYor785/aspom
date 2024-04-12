import mongoose from "mongoose";


const leaveBalanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true
    },
    annualLeave: {
        type: Number,
        default: 20
    },
    casualLeave: {
        type: Number,
        default: 5
    },
    otherLeave: {
        type: Number,
        default: 0
    },
})


const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema)

export default LeaveBalance