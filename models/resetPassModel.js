import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema(
    {
        userId: {type: String, unique: true},
        email: {type: String, unique: true},
        token: String,
        createdAt: Date,
        expiredAt: Date,
    }
)

const PasswordReset = mongoose.model("PasswordReset", resetPasswordSchema)

export default PasswordReset