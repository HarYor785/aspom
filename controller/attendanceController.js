import Attendance from "../models/attendanceModel.js";
import AuthUser from "../models/authModel.js"
import { assignJwt } from "../utils/index.js"
import Holiday from "../models/holidayModel.js"
import LeaveRequest from "../models/leaveRequest.js"

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


// Clock-in controller
export const clockIn = async (req, res) => {
    try {
        const { userId } = req.body.user;
        
        const currentTime = new Date();
        const day = currentTime.getDate()
        
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const existingAttendance = await Attendance.findOne({
            user,
            month: getCurrentMonthAndYear().month,
            year: getCurrentMonthAndYear().year,
            'days.day': day,
            'days.clockIn': { $ne: null } // Check if clockIn is not null
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'You have already clocked in for the day'
            });
        }

        let status = 'Absent'; // Default status
        
        if (currentTime.getHours() < 9) {
            status = 'Present'; // If clock-in before 9 am, status is 'Present'
        } else if (currentTime.getHours() >= 9 && currentTime.getHours() < 18) {
            status = 'Late'; // If clock-in after 9 am but before 6 pm, status is 'Late'
        }

        let attendance = await Attendance.findOne({
            user: userId,
            month: getCurrentMonthAndYear().month,
            year: getCurrentMonthAndYear().year
        })
        
        if (!attendance) {

            attendance = new Attendance({
                user: userId,
                month: getCurrentMonthAndYear().month,
                year: getCurrentMonthAndYear().year,
                days: []
            })

        } 

        const dayIndex = attendance.days.findIndex(item => item.day === day);
        if (dayIndex !== -1) {
            attendance.days[dayIndex].clockIn = currentTime;
            // Set status based on clock-in time
            attendance.days[dayIndex].status = status;
        } else {
            // If the day doesn't exist, create a new entry for it
            attendance.days.push({
                day,
                clockIn: currentTime,
                // Set status based on clock-in time
                status: status
            });
        }

        attendance.totalMarkedDays++;

        await attendance.save()

        if (!user.attendance.includes(attendance._id)) {
            await AuthUser.findByIdAndUpdate(userId, {
                $addToSet: { attendance: attendance._id }
            });
        }
        
        // Fetch the user with populated fields
        const getUser = await AuthUser.findById(userId)
        .populate({
            path: 'attendance'
        }) // Populate attendance
        .populate({
            path: 'todolist'
        }) // Populate tasks
        .populate({
            path: 'reports'
        });

        getUser.password = undefined

        const token = assignJwt(getUser._id, getUser.role)
        
        return res.status(200).json({
            success: true,
            message: `You Clocked In at`,
            user: getUser,
            token
        });

    } catch (error) {
        console.error(error);
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
};

// Clock-out controller
export const clockOut = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const clockOutTime = new Date();
        const day = clockOutTime.getDate(); // Extract day from current time
        const month = getCurrentMonthAndYear().month
        const year = getCurrentMonthAndYear().year

        const user = await AuthUser.findById(userId)
        
        if(!user){
            return res.status.json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        // if(clockOutTime.getHours() < 18){
        //     return res.status(403).json({
        //         success: false,
        //         message: 'You can only clock out after 6PM!'
        //     })
        // }

        // Check if the user has already clocked out for the day
        const existingAttendance = await Attendance.findOne({
            user,
            month,
            year,
            'days.day': day,
            'days.clockOut': { $ne: null } // Check if clockOut is not null
        });

        if (existingAttendance) {
            return res.status(400).json({ 
                success: false, 
                message: 'You already clocked out for the day!' 
            });
        }

        // Check if the user has clocked in for the day
        const todayAttendance = await Attendance.findOne({
            user,
            month,
            year,
            'days.day': day,
            'days.clockIn': { $ne: null } // Check if clockIn is not null
        });

        if (!todayAttendance) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have not clocked in for the day!' 
            });
        }

        // Find or create attendance record for the user, month, and year
        let attendance = await Attendance.findOne({ user, month, year });

        if (!attendance) {
            return res.status(400).json({ 
                success: false, 
                message: 'Clock-out already performed for the day' 
            });
        }

        // Find the day in the attendance record and update clock-out time
        const dayIndex = attendance.days.findIndex(item => item.day === day);
        if (dayIndex !== -1) {
            attendance.days[dayIndex].clockOut = clockOutTime;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'User has not clocked in for the day' 
            });
        }

        await attendance.save()

        // Fetch the user with populated fields
        const getUser = await AuthUser.findById(userId)
        .populate({
            path: 'attendance'
        }) // Populate attendance
        .populate({
            path: 'todolist'
        }) // Populate tasks
        .populate({
            path: 'reports'
        });

        getUser.password = undefined

        const token = assignJwt(getUser._id, getUser.role)

        return res.status(200).json({
            success: true,
            message: 'You Clock-out for the day!',
            user: getUser,
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

export const allAttendance = async (req, res) => {
    try{
        const { userId } = req.body.user;

        const user = await AuthUser.findById(userId)
        
        if(!user){
            return res.status.json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const attendance = await Attendance.find().populate({
            path: 'user',
            select: 'staffId firstName lastName role department'
        }).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            message: 'Attendance fetched successfully!',
            data: attendance
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

// Function to get the start of the day for a given date
const startOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    return start;
};

// Function to get the end of the day for a given date
const endOfDay = (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999); // Set hours, minutes, seconds, and milliseconds to end of the day
    return end;
};

// Function to update attendance statuses daily at 6 PM
export const dailyAttendanceUpdate = async () => {
    try {
        const currentTime = new Date();
        const today = currentTime.getDate();
        const month = getCurrentMonthAndYear().month;
        const year = getCurrentMonthAndYear().year;
        const formattedClockInTime = new Date(currentTime.setHours(0, 0, 0, 0)).toISOString();

        // Check for holidays on the current day
        const holiday = await Holiday.findOne({ date: { $gte: startOfDay(currentTime), $lt: endOfDay(currentTime) } });

        // If it's a holiday, create attendance entries with status 'Holiday' for all users
        if (holiday) {
            const users = await AuthUser.find(); // Get all users
            await Promise.all(users.map(async (user) => {
                    let attendance = await Attendance.findOne({
                        user: user._id,
                        month,
                        year
                    });
                    if (!attendance) {
                        attendance = new Attendance({
                            user: user._id,
                            month,
                            year,
                            days: [],
                            totalNotMarkedDays: 0
                        });
                    }
                    attendance.days.push({
                        day: today,
                        status: 'Holiday',
                        clockIn: formattedClockInTime
                    });
                    await attendance.save();
                }));
            console.log('Attendance statuses updated to "Holiday" for today.');
        } else {
            // Check for leave requests on the current day with approved or pending status
            const leaveRequests = await LeaveRequest.find({
                startDate: { $lte: currentTime },
                endDate: { $gte: currentTime },
                $or: [
                    { uhApproval: 'Approved' },
                    { hrApproval: 'Approved' },
                    { adminApproval: 'Approved' },
                ]
            });

            await Promise.all(leaveRequests.map(async (request) => {
                let attendance = await Attendance.findOne({
                    user: request.user,
                    month,
                    year
                });
                if (!attendance) {
                    attendance = new Attendance({
                        user: request.user,
                        month,
                        year,
                        days: [],
                        totalNotMarkedDays: 0
                    });
                }
                attendance.days.push({
                    day: today,
                    status: 'On Leave',
                    clockIn: formattedClockInTime
                });
                await attendance.save();
            }));

            console.log('Attendance statuses updated to "On Leave" for users with approved leave requests.');
            
            // Create a new clock-in entry for users who didn't clock in
            const usersWithoutClockIn = await Attendance.find({ month, year, 'days.day': today, 'days.clockIn': null });
            await Promise.all(usersWithoutClockIn.map(async (userAttendance) => {
            const dayIndex = userAttendance.days.findIndex(day => day.day === today && !day.clockIn);
            if (dayIndex !== -1) {
                let attendance = await Attendance.findOne({
                    user: userAttendance.user,
                    month,
                    year
                });
                
                if (!attendance) {
                    attendance = new Attendance({
                        user: userAttendance.user,
                        month,
                        year,
                        days: [],
                        totalNotMarkedDays: 0
                    });
                }

                const findDayIndex = attendance.days.findIndex(item => item.day === today);
                if (findDayIndex !== -1) {
                    // Update existing entry
                    attendance.days[findDayIndex].clockIn = formattedClockInTime;
                    attendance.days[findDayIndex].status = 'Absent';
                } else {
                    // Create new entry
                    attendance.days.push({
                        day: today,
                        clockIn: formattedClockInTime, 
                        status: 'Absent'
                    });
                }

                // Increment totalNotMarkedDays
                attendance.totalNotMarkedDays++;
                await attendance.save();
            }
        }));

            console.log('Attendance statuses updated to "Absent" for users who didn\'t clock in.');
        }

    } catch (error) {
        console.error('Error updating attendance statuses:', error);
    }
};