import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"AuthUser"},
    reasons: {type: String},
    noticeDate: {type: Date},
    resignDate: {type: Date},
},{timestamps: true})

const Resignation = mongoose.model('Resignation', resignationSchema)

export default Resignation