import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {type: String},
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    total: {type: Number},
},{timestamps: true})

const Department = new mongoose.model('Department', departmentSchema)

export default Department