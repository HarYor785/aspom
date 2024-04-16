import mongoose from "mongoose";


const getCurrentMonthAndYear = () => {
    const now = new Date()
    return{
        month: getMonthName(now.getMonth()),
        year: now.getFullYear()
    }
}

const getMonthName = (monthIndex) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
};

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AuthUser'
    },
    month: {
        type: Number,
        default: () => new Date().getMonth + 1,
        required: true
    },
    year: {
        type: Number,
        default: () => new Date().getFullYear(),
        required: true
    },
    todolist: [
        {
            title: {type: String},
            description: {
                type: String,
                required: [true, 'Description is required']
            },
            status: {
                type: String,
                enum: ['Waiting', 'InProgress', 'Completed'],
                default: 'InProgress'
            },
            progress: {
                type: Number,
                min: 0,
                max: 100
            },
            attachment: {
                type: String,
            },
            assign: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'AuthUser'
            },
            team: [{
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'AuthUser'
            }],
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    totalMarkedDays: {
        type: Number,
        default: 0
    },
    totalNotMarkedDays: {
        type: Number,
        default: 0
    }
},{timestamps: true})


const Tasks = new mongoose.model('Tasks', taskSchema)

export default Tasks