import mongoose from "mongoose";


const notifcationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    title: {type: String},
    body: {type: String},
},{timestamps: true})

const Notifications = new mongoose.model('Notifications', notifcationSchema)

export default Notifications