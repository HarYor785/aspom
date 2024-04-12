import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL)
        console.log('Db Connected Successfuly')
    } catch (error) {
        console.log(error)
    }
}

export default dbConnection