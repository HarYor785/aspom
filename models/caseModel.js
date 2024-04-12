import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    caseId: {
        type: String
    },
    issue:{
        type: String,
    },
    department: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Open', 'In Progress', 'Escalated', 'On Hold', 'Resolved', 'Closed'],
        default: 'Pending',
    }
},{timestamps: true})


const Cases = mongoose.model('Cases', caseSchema)

export default Cases