import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import mongosanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import bodyParser from 'body-parser'
import errorMiddleware from './middleware/errorMiddleware.js'
import router from './routes/index.js'
import dbConnection from './dbConfig/index.js'
import initSocket from './socket.js'
import { handleCronJobs } from './utils/index.js'
import { updateTasksStatistics } from './controller/taskController.js'
import { updateReportStatistics } from './controller/reportController.js'
import { dailyAttendanceUpdate } from './controller/attendanceController.js'
import cron from 'node-cron'
import requestIp from 'request-ip'



dotenv.config()

const app = express()

const PORT = process.env.PORT || 6000

// Initialize socket.io and get the express server
const expressServer = initSocket(app);

app.use(cors())
app.use(helmet())
app.use(xss())
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json({limit: '10mb'}))
app.use(mongosanitize())

app.use(morgan('dev'))

handleCronJobs(app)

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(express.static('public'))

dbConnection()

// app.use(requestIp.mw()) // Get client IP address
// Define the whitelisted WiFi network IP address
// const wifiNetworkIP = '192.168.11.21'; // Example IP address of the WiFi network
const wifiNetworkIP = '172.20.10.8'; // Example IP address of the WiFi network

// Middleware function to check the user's IP address against the WiFi network IP
// const restrictToWiFiNetwork = (req, res, next) => {
//   const userIP = req.ip
  
//     console.log('The user IP', userIP)

//     if (userIP === wifiNetworkIP || userIP === `::ffff:${wifiNetworkIP}`) {
//         // User's IP address matches the WiFi network IP
//         next();
//         // res.status(403).json({
//         //     success: true,
//         //     message: 'Access granted.'
//         // });
//     } else {
//         // User's IP address does not match the WiFi network IP
//         res.status(403).json({
//             success: false,
//             message: 'Access forbidden.'
//         });
//     }
// };

// app.use(restrictToWiFiNetwork)

app.get('/',(req, res)=>{
    res.send(req.ip)
})

app.use(router)

app.use(errorMiddleware)

expressServer.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`)
})

const io = app.get('io');

// Schedule the status update function to run every day at 6 pm
// cron.schedule('30 20 * * *', async () => {
cron.schedule('0 18 * * *', async () => {
    console.log('Running attendance update.');
    await dailyAttendanceUpdate();
});

cron.schedule('0 12 * * *', async () => {
    console.log('Running task update at 12 PM.');
    await updateTasksStatistics();
});

cron.schedule('59 23 * * *', async () => {
    console.log('Running report update at 11:59 PM.');
    await updateReportStatistics();
});

// Schedule the cron job to trigger 10 minutes before 12 PM every day for todolist
cron.schedule('50 11 * * *', () => {
    // Emit a socket event to all connected clients
    io.emit('notification', { message: 'You have 10 minutes left to submit your today todo-list', activities: true });
});


// Schedule the cron job to trigger 10 minutes before 6 PM every day for daily reports
cron.schedule('50 17 * * *', () => {
    // Emit a socket event to all connected clients
    io.emit('notification', { message: 'A reminder to submit your daily report before clocking out!', activities: true });
});