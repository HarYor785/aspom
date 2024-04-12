import mongoose from "mongoose";

const terminationSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"AuthUser"},
    reasons: {type: String},
    type: {type: String},
    noticeDate: {type: Date},
    terminationDate: {type: Date},
},{timestamps: true})

const Termination = mongoose.model('Termination', terminationSchema)

export default Termination