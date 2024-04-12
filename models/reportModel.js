import mongoose from "mongoose";


const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    reports: [{
        title: { type: String,},
        description: { type: String, required: true },
        attachment: {type: String},
        date: { type: Date, default: Date.now }
    }],
    totalSubmitted: {
        type: Number,
        default: 0
    },
    totalMissed: {
        type: Number,
        default: 0
    }
},{timestamps: true,})

const Reports = new mongoose.model('Reports', reportSchema)

export default Reports