import mongoose from "mongoose";


const payrollSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
    },
    salary: {
        type: Number,
        required: true
    },
    deduction: [{
        name: {
            type: String,
        },
        amount: {
            type: Number,
        }
    }],
    status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Pending'],
        default: 'Unpaid'
    }
},{timestamps: true})

const Payroll = mongoose.model('Payroll', payrollSchema)

export default Payroll