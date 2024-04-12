import mongoose from "mongoose";


const leaveRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    days: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    leaveType: {
        type: String,
        enum: ['Annual Leave', 'Casual Leave', 'Other Leave', 'Exam Leave', 'Maternity Leave', 'Emergency Leave', 'Others'],
        default: 'Annual Leave',
    },
    uhApproval: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending',
    },
    hrApproval: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending',
    },
    adminApproval: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending',
    },
},{timestamps: true})

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema)


export default LeaveRequest