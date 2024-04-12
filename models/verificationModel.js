import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
    {
        userId: String,
        code: String,
        createdAt: Date,
        expiredAt: Date,
    }
)

const Verification = mongoose.model("Verification", verificationSchema)

export default Verification