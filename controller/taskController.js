import AuthUser from "../models/authModel.js"
import Tasks from "../models/tasksModel.js"
import Notifications from "../models/notificationModel.js";
import Holiday from "../models/holidayModel.js";
import LeaveRequest from "../models/leaveRequest.js";
import moment from 'moment'
import { assignJwt } from "../utils/index.js"
import { tasks_v1 } from "googleapis";




/* ********************** *\
|TODO LIST
\* ********************** */ 

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


// CREATE TASK
export const createTask = async (req, res, io) => {
    try {
        const {userId} = req.body.user
        const {
            title,
            description,
            status,
            progress,
            teamArray,
        } = req.body
        const file = req.file
        const today = new Date()
        const day = today.getDate()
        const taskHour = today.getHours();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        if(!description || !title || !status){
            return res.status(403).json({
                success: false,
                message: 'Empty Required Field'
            })
        }

        const user = await AuthUser.findById(userId)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        // Check if the current hour is 12 PM or later
        if (today.getHours() >= 12) {
            return res.status(403).json({
                success: false,
                message: "Tasks can't be submitted after 12 PM"
            })
        }
        
        if(teamArray && teamArray.length > 0){
            await Promise.all(teamArray.map(async(teamUp)=>{
                const member = await AuthUser.findOne({_id: teamUp})

                let todoLists = await Tasks.findOne({
                    user: member._id,
                    month: month,
                    year: year
                })        
        
                if(!todoLists){
                    todoLists = new Tasks({
                        user: member._id,
                        month: month,
                        year: year,
                        todolist: []
                    })

                    const task = await todoLists.save()
                    // Update member's tasks
                    await Promise.all([
                        AuthUser.findByIdAndUpdate(member._id, {
                            $push: { todolist: task._id },
                        })
                    ]);
                }

                // Check if the user has already submitted a task for today
                const submittedToday = todoLists.todolist.some(task => task.date.toDateString() === today.toDateString());

                todoLists.todolist.push({
                    title,  
                    description,  
                    status: status ? status : 'InProgress', 
                    progress: progress ? progress : 0,
                    assign: user._id,
                    team: teamArray ? teamArray : [],
                    attachment: file ? file.filename : '',
                    date: today
                })
                if(!submittedToday){
                    todoLists.totalMarkedDays++;
                }

                await todoLists.save()

            }))
        }else{

            let todoLists = await Tasks.findOne({
                user: userId,
                month: month,
                year: year
            })        
    
            if(!todoLists){
                todoLists = new Tasks({
                    user: userId,
                    month: month,
                    year: year,
                    todolist: []
                })

                const task = await todoLists.save()
                await AuthUser.findByIdAndUpdate(user._id, {
                    $push: { todolist: task._id },
                });
            }

            // Check if the user has already submitted a task for today
            const submittedToday = todoLists.todolist.some(task => task.date.toDateString() === today.toDateString());

            todoLists.todolist.push({
                title,  
                description,  
                status: status ? status : 'InProgress', 
                progress: progress ? progress : 0,
                attachment: file ? file.filename : '',
                date: today
            })
            if(!submittedToday){
                todoLists.totalMarkedDays++;
            }
    
            // }else{
            //     todoLists.todolist.push({
            //         title,  
            //         description,  
            //         status: status ? status : 'InProgress', 
            //         progress: progress ? progress : 0,
            //         attachment: file ? file.filename : '',
            //         // date: today
            //     })
            // }
            
            await todoLists.save()

        }

        const userTask = await Tasks.find({user: userId})
        .populate({
            path: 'todolist.team'
        })
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

        res.status(200).json({
            success: true,
            message: 'Todo list submitted successfuly',
            data: userTask,
            user: getUser,
            token
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

// UPDATE TASK
export const updateTasks = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params
        const {status, progress, description, title} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed'
            })
        }

        const task = await Tasks.findById(id)

        if(!task){
            return res.status(403).json({
                success: false,
                message: 'Task not found'
            })
        }

        const update = await Tasks.findByIdAndUpdate({_id: id},{
            title,
            description,
            progress,
            status
        },{new: true})

        const userTask = await Tasks.find({user: userId})
        .populate({
            path: 'team'
        })
        .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: 'Todo list updated successfuly',
            data: userTask
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

// UPDATE PROGRESS
export const updateTaskProgress = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params
        const {progress} = req.body

        const currentDate = new Date()
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed'
            })
        }

        const task = await Tasks.findOne({ user: userId, month, year });

        // Find the index of the task item in the todolist array
        const taskItemIndex = task.todolist.findIndex(item => item._id.toString() === id);

        // If task item is not found, return an error response
        if (taskItemIndex === -1) {
            return res.status(403).json({ success: false, message: 'Task item not found' });
        }

        // Update the progress and status of the task item
        task.todolist[taskItemIndex].progress = progress;
        task.todolist[taskItemIndex].status = progress === 100 || progress === '100' ? 'Completed' : 'InProgress';

        // Save the changes to the database
        await task.save();  

        const userTask = await Tasks.find({user: userId})
        .populate({
            path: 'todolist.team'
        })
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
            message: 'Task progress updated successfuly',
            data: userTask,
            user: getUser,
            token
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

// GET USER TASK
export const getUserTasks = async (req, res) => {
    try {
        const {userId} = req.body.user;
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const allTasks = await Tasks.find({user: userId
        }).populate({
            path: 'todolist.team',
        }).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            data: allTasks
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}

export const getAllTasks = async (req, res) => {
    try {
        const {userId} = req.body.user;

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const currentDate = new Date();

        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

        const userTaskCounts = await Tasks.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        user: "$user", 
                        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
                    },
                    count: { $sum: 1 } 
                }
            },
            {
                $group: {
                    _id: "$_id.user", 
                    taskCounts: { $push: { day: "$_id.day", count: "$count" } } 
                }
            }
        ]);

        const totalDays = endDate.getDate();

        const taskData = userTaskCounts.map(({ _id, taskCounts }) => {
            const userTotalDays = taskCounts.length;
            const missedDays = totalDays - userTotalDays;
            return { user: _id, missedDays, totalDays };
        });

        res.status(200).json({
            success: true,
            data: taskData
        });
    } catch (error) {
        console.error('Error fetching users task counts and missed days:', error);
        throw error;
    }
};



export const getUserTaskStatistics = async (req, res) => {
    try {
        const {userId} = req.body.user;
        const {month} = req.params
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Normalize to start of day
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); 

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const users = await AuthUser.find();

        const userStatisticsArray = await Promise.all(users.map(async (user) => {
            const tasks = await Tasks.findOne({ 'user': user._id });
        
            if (tasks && tasks.todolist) {
                const currentDayOfMonth = moment().date();
                const startOfMonth = moment(month, 'MM').startOf('month'); // Use the month from req.body
                const endOfMonth = moment(month, 'MM').endOf('month'); // Use the month from req.body
        
                let totalDaysTasksSubmitted = 0;
                let totalMissed = 0;
                let totalHolidays = 0;
                let totalWorkingDays = 0;
        
                const holidays = await Holiday.find();

                for (let day = startOfMonth.clone(); day <= endOfMonth; day.add(1, 'day')) {
                    const isWeekend = day.day() === 0 || day.day() === 6; // Sunday is 0, Saturday is 6
                    const taskDay = moment(day);
                    const taskExists = tasks.todolist.some(task => moment(task.date).isSame(taskDay, 'day'));
                    const isHoliday = holidays.some(holiday => moment(holiday.date).isSame(taskDay, 'day'));
        
                    if (!isWeekend && !isHoliday) {
                        totalWorkingDays++;
                    }
        
                    if (!isWeekend && !isHoliday && !taskExists) {
                        totalMissed++;
                    }
        
                    if (taskExists) {
                        totalDaysTasksSubmitted++;
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
                    totalDaysTasksSubmitted,
                    totalMissed,
                    totalHolidays,
                    totalWorkingDays
                };
            }
        }));


        // const today = moment();
        // const startOfMonth = today.clone().startOf('month');
        // const currentDayOfMonth = today.date(); 

        // const currentMonthTasks = await Tasks.find({
        //     createdAt: {
        //         $gte: startOfMonth.toDate(),
        //         $lte: today.toDate()
        //     }
        // }).populate({
        //     path: 'user',
        //     select: 'firstName lastName staffId department role'
        // }).sort({createdAt: -1})

        // const userStatistics = {};
        
        // currentMonthTasks.forEach(task => {
        //     const userId = task.user._id.toString();
        //     const submissionDay = moment(task.createdAt).date();

        //     if (!userStatistics[userId]) {
        //         userStatistics[userId] = {
        //             user: task.user,
        //             totalDaysTasksSubmitted: 0,
        //             totalDaysMissed: 0
        //         };
        //     }

        //     if (!userStatistics[userId].submittedDays || !userStatistics[userId].submittedDays.includes(submissionDay)) {
        //         userStatistics[userId].totalDaysTasksSubmitted++;
        //         userStatistics[userId].submittedDays = [...(userStatistics[userId].submittedDays || []), submissionDay];
        //     }

        //     userStatistics[userId].totalDaysMissed = currentDayOfMonth - userStatistics[userId].totalDaysTasksSubmitted;
        // });

        // const userStatisticsArray = Object.values(userStatistics);

        res.status(200).json({
            success: true,
            data: userStatisticsArray
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error" 
        });
    }
}

export const getAdminTasks = async (req, res) => {
    try{
        const {userId} = req.body.user;

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: "Authorization failed!"
            })
        }

        const tasks = await Tasks.find()

        res.status(200).json({
            success: true,
            data: tasks
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}

/* ********************** *\
|END OF TODO LIST CONTROLLER
\* ********************** */ 


// TASKS STATISTICS FUNCTION
export const updateTasksStatistics = async () => {
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
                let tasks = await Tasks.findOne({
                    'user': user._id,
                    // 'todolist.date': { $gte: startOfDay, $lte: endOfDay },
                    month,
                    year
                })

                // If no task found for today, create a new one
                if (!tasks) {
                    tasks = new Tasks({
                        user: user._id,
                        month,
                        year,
                        todolist: []
                    });
                    await tasks.save();
                }

                // Update totalMissed for the user if task not found for today
                if (!tasks.todolist || !tasks.todolist.some(item => item.date.toDateString() === today.toDateString())) {
                    tasks.totalNotMarkedDays++;
                    console.log('Incrementing...');
                    await tasks.save();
                }
            }))

            console.log('Task Updated!')

        } else {
            console.log('No task update needed. Today is Saturday or Sunday.');
        }

    } catch (error) {
        console.error('Error updating daily tasks:', error);
    }
}



