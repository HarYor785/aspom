import AuthUser from "../models/authModel.js"
import Reports from "../models/reportModel.js";
import Holiday from "../models/holidayModel.js";
import LeaveRequest from "../models/leaveRequest.js";
import { assignJwt } from "../utils/index.js"
import moment from 'moment'


/* ********************** *\
|REPORTS
\* ********************** */ 
// PENDING SUBMIT REPORTS ---
export const submitReport = async (req, res) => {
    try {
        const {userId} = req.body.user
        const { title, description, date } = req.body;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dayStart = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of the current day
        const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999)); // Normalize to end of day
        const file = req.file
        let filename;

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed'
            })
        }
        
        // console.log(currentDate.getHours())

        // if(currentDate.getHours() < 18){
        //     return res.status(403).json({
        //         success: false,
        //         message: "Reports can't be submitted before 6 PM"
        //     })
        // }

        const submittedToday = await Reports.findOne({
            user: user._id,
            'reports.date': { $gte: dayStart, $lte: dayEnd }
        });

        if(submittedToday){
            return res.status(200).json({
                success: false,
                message: 'You have submitted a report for today.'
            })
        }

        // if (!date) {
        //     // currentDate = new Date(date);
        //     // if (isNaN(currentDate.getTime())) {
        //         return res.status(400).json({
        //             success: false,
        //             message: 'Invalid date format'
        //         });
        //     // }
        // }

        if(file){
            filename = file.filename
        }else{
            filename = ''
        }

        // Check if monthly report already exists for the user and month
        let monthlyReport = await Reports.findOne({ user: userId, year, month });

        if (!monthlyReport) {
            // Create a new monthly report if it doesn't exist
            monthlyReport = new Reports({
                user: userId,
                year,
                month,
                reports: [{ title, description, attachment: filename, date: date ? date : currentDate }],
            });

            const report = await monthlyReport.save()
            await AuthUser.findByIdAndUpdate(user._id,{
                $push: {reports: report._id}
            })

        } else {
            // Update existing monthly report if it exists
            monthlyReport.reports.push({ title, description, attachment: filename, date: date ? date : currentDate });
        }

        monthlyReport.totalSubmitted++

        // Save the monthly report
        await monthlyReport.save();

        const userReport = await Reports.find({user: userId})
        .sort({ createdAt: -1 })

        const getUser = await AuthUser.findById(user._id).populate({
            path: 'attendance'
        }).populate({
            path: 'todolist'
        }).populate({
            path: 'reports'
        })

        const token = assignJwt(user._id, user.role)

        getUser.password = undefined

        return res.status(200).json({
            success: true,
            message: "You have successfully submited today's reported",
            data: userReport,
            user: getUser,
            token
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server error!",
        })
    }
}

// FETCH USER REPORTS
export const getReports = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Auhtorization failed!'
            })
        }

        const reports = await Reports.find({user: userId}).sort({createdAt: -1})

        res.status(200).json({
            success: true, 
            data: reports
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

// FETCH ALL REPORTS
export const getAllReports = async (req, res) => {
    try {
        const {userId} = req.body.user;
        const {month} = req.params
        
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const users = await AuthUser.find();

        const userStatisticsArray = [];

        for (const user of users) {
            const reports = await Reports.findOne({ user: user._id, month: month });

            if (reports && reports.reports) {
                const holidays = await Holiday.find();

                const startOfMonth = moment(month, 'MM').startOf('month');
                const endOfMonth = moment(month, 'MM').endOf('month');
                const currentDayOfMonth = moment().date();
                const currentMonth = moment().format('MM')

                let totalReportSubmitted = 0;
                let totalMissed = 0;
                let totalHolidays = 0;
                let totalWorkingDays = 0;

                for (let day = startOfMonth.clone(); day <= endOfMonth; day.add(1, 'day')) {
                    const isWeekend = day.day() === 0 || day.day() === 6; // Sunday is 0, Saturday is 6
                    const isHoliday = holidays.some(holiday => moment(holiday.date).isSame(day, 'day'));
                    const reportExists = reports.reports.some(report => moment(report.date).isSame(day, 'day'));

                    if (!isWeekend && !isHoliday) {
                        totalWorkingDays++;
                    }
        
                    if (!isWeekend && !isHoliday && !reportExists) {
                        // Exclude counting missed tasks for the current day
                        if (currentMonth === month && day.date() !== currentDayOfMonth) {
                            totalMissed++;
                        }else if(currentMonth !== month){
                            totalMissed++
                        }
                    }

                    if (reportExists) {
                        totalReportSubmitted++;
                    }
        
                    if (isHoliday) {
                        totalHolidays++;
                    }

                    if (currentMonth === month && day.date() === currentDayOfMonth) {
                        break; // Stop loop when reaching the current day
                    }
                }

                userStatisticsArray.push({
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        staffId: user.staffId,
                        department: user.department,
                        role: user.role
                    },
                    totalReportSubmitted,
                    totalMissed,
                    totalHolidays,
                    totalWorkingDays,
                    createdAt: reports.createdAt
                });
            }
        }

        res.status(200).json({
            success: true,
            data: userStatisticsArray
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server error!"
        })
    }
}



// SINGLE STAFF REPORTS STATS (HAVE NOT IMPLEMENT)
export const userReportsStat = async (req, res) => {
    try {
        const {userId} = req.body.user;
        // const {month} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const users = await AuthUser.find();

        const userStatisticsArray = await Promise.all(users.map(async (user) => {
            const report = await Reports.findOne({ 'user': user._id})

            if(report && report.reports){
                const currentDayOfMonth = moment().date();
                const startOfMonth = moment(month, 'MM').startOf('month'); // Use the month from req.body
                const endOfMonth = moment(month, 'MM').endOf('month'); // Use the month from req.body
            
                let totalReportSubmitted = 0;
                let totalMissed = 0;
                let totalHolidays = 0;
                let totalWorkingDays = 0;

                const holidays = await Holiday.find();
            
                for (let day = startOfMonth.clone(); day <= endOfMonth; day.add(1, 'day')) {
                    const isWeekend = day.day() === 0 || day.day() === 6; // Sunday is 0, Saturday is 6
                    const taskDay = moment(day);
                    const reportExists = report.reports.some(rep => moment(rep.date).isSame(taskDay, 'day'));
                    const isHoliday = holidays.some(holiday => moment(holiday.date).isSame(taskDay, 'day'));

                    if (!isWeekend && !isHoliday) {
                        totalWorkingDays++;
                    }
        
                    if (!isWeekend && !isHoliday && !reportExists) {
                        totalMissed++;
                    }

                    if (reportExists) {
                        totalReportSubmitted++;
                    }
        
                    if (isHoliday) {
                        totalHolidays++;
                    }
            
                    if (day.date() === currentDayOfMonth) {
                        break; // Stop loop when reaching the current day
                    }
                }

                return {
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        staffId: user.staffId,
                        department: user.department,
                        role: user.role
                    },
                    totalReportSubmitted,
                    totalMissed,
                    totalHolidays,
                    totalWorkingDays,
                    createdAt: report.createdAt
                };
            }
        
        }));

        res.status(200).json({
            success: true,
            data: userStatisticsArray
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server error!"
        })
    }
}

export const getAdminReports = async (req, res) => {
    try{
        const {userId} = req.body.user;

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const reports = await Reports.find()

        res.status(200).json({
            success: true,
            data: reports
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}

// Function to get the start of the day for a given date
const startOfDayFunc = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    return start;
};

// Function to get the end of the day for a given date
const endOfDayFunc = (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999); // Set hours, minutes, seconds, and milliseconds to end of the day
    return end;
};

export const updateReportStatistics = async ()=>{
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Normalize to start of day
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Normalize to end of day

        // Check if today is not Saturday or Sunday
        if (!(dayOfWeek === 0 || dayOfWeek === 6)) {

            // Check if today is a holiday
            const holiday = await Holiday.findOne({ date: { $gte: startOfDayFunc(today), $lt: endOfDayFunc(today)} });

            // If today is a holiday, skip report update
            if (holiday) {
                console.log('No report update needed. Today is a holiday.');
                return;
            }

            // Get current month and year
            const year = today.getFullYear();
            const month = today.getMonth() + 1;

            // Find all users
            const allUsers = await AuthUser.find();

            await Promise.all(allUsers.map(async(user)=>{
                let report = await Reports.findOne({
                    'user': user._id,
                    month,
                    year
                })

                // If no task found for today, create a new one
                if (!report) {
                    report = new Reports({
                        user: user._id,
                        month,
                        year,
                        reports: []
                    });
                    await report.save();
                }

                // Update totalMissed for the user if task not found for today
                if (!report.reports || !report.reports.some(item => moment(item.date).format("DD MMMM YYYY") === moment(today).format("DD MMMM YYYY"))) {
                    report.totalMissed++;
                    console.log('Incrementing report...');
                    await report.save();
                }
            }))

            console.log('Report Updated!')

        } else {
            console.log('No report update needed. Today is Saturday or Sunday.');
        }
    } catch (error) {
        console.error('Error updating daily reports:', error);
    }
}

/* ********************** *\
|END OF REPORT CONTROLLER
\* ********************** */ 