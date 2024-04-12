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

const attendanceReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    month: {
        type: String,
        default: getCurrentMonthAndYear().month,
        required: true
    },
    year: {
        type: String,
        default: getCurrentMonthAndYear().year,
        required: true
    },
    days: [{
        day: {
            type: Number,
            required: true
        },
        clockIn: {
            type: Date,
            default: null // Set default value to null
        },
        clockOut: {
            type: Date,
            default: null // Set default value to null
        },
        status: {
            type: String,
            enum: ['Present', 'Late', 'Absent', 'On Leave', 'Not Marked', 'Holiday'],
            default: 'Not Marked'
        }
    }],
    totalMarkedDays: {
        type: Number,
        default: 0
    },
    totalNotMarkedDays: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// attendanceReportSchema.pre('save', function(next) {
//     // Calculate total marked days and total not marked days
//     let totalMarkedDays = 0;
//     let totalNotMarkedDays = 0;

//     // Get the current day of the month
//     const currentDayOfMonth = new Date().getDate();

//     // Iterate through each day in the attendance report
//     this.days.forEach(day => {
//         if (day.status !== 'Not Marked') {
//             totalMarkedDays++;
//         } else {
//             // Check if the day is before the current day of the month
//             if (day.day < currentDayOfMonth) {
//                 totalNotMarkedDays++;
//             }
//         }
//     });

//     this.totalMarkedDays = totalMarkedDays;
//     this.totalNotMarkedDays = totalNotMarkedDays;

//     next();
// });

const Attendance = mongoose.model('Attendance', attendanceReportSchema);

export default Attendance;