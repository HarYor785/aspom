import mongoose from "mongoose";


const addressSchema = new mongoose.Schema({
    street: {type: String},
    state: {type: String},
    country: {type: String},
})


const bankInfoSchema = new mongoose.Schema({
    bankName: {type: String},
    accountName: {type: String},
    accountNo: {type: String},
    salaryAmount: {type: String},
    salaryBasis: {type: String},
    paymentType: {type: String},
})


const authSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true,'First name is required']
        },
        lastName: {
            type: String,
            required: [true,'Last name is required']
        },
        email: {
            type: String,
            required: [true,'Email is required'],
            unique: true,
        },
        staffId: {
            type: String,
            required: [true,'Staff ID is required']
        },
        password: {
            type: String,
        },
        phone: {
            type: String
        },
        role: {
            type: String,
            // required: [true,'Role is required']
        },
        department: {
            type: String,
            // required: [true,'Department is required']
        },
        profilePic: {
            type: String,
        },
        gender: {
            type: String,
        },
        joinDate: {
            type: Date,
            default: Date.now()
        },
        birthDay: {
            type: String,
        },
        address: addressSchema,
        bankInfo: bankInfoSchema,
        attendance: [{type: mongoose.Schema.Types.ObjectId, ref: 'Attendance'}],
        todolist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        reports: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reports'
        }],
        verified: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
)


const AuthUser = new mongoose.model('AuthUser', authSchema)

export default AuthUser
