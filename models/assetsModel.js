import mongoose from "mongoose";

const assetsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    gadget: {
        type: String,
        required: [true, 'Enter gadget name'],
    },
    assignee: {type: String},
    date: {
        type: Date
    }
},{timestamps: true})


const Assets = new mongoose.model('Assets', assetsSchema)

export default Assets