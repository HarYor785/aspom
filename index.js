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

// Route to handle IP address and get user location
// app.post('/api/get-location', async (req, res) => {
//     try {
//         const { ipAddress } = req.body;
//         const userLocation = await fetchUserLocation(ipAddress);
//         const allowedLocation = await Location.findOne({ name: 'HRMS Location' });
//         const distance = calculateDistance(userLocation.latitude, userLocation.longitude, allowedLocation.latitude, allowedLocation.longitude);

//         if (distance <= 1000) { // Define your threshold distance (e.g., 1000 meters)
//             res.json({ access: true });
//         } else {
//             res.json({ access: false });
//         }
//     } catch (error) {
//         console.error('Error fetching user location:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Function to fetch user location based on IP address
// const fetchUserLocation = async (ipAddress) => {
//     const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
//     const data = await response.json();
//     return { latitude: data.latitude, longitude: data.longitude };
// };

// // Function to calculate distance between two points using Haversine formula
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3; // Radius of the Earth in meters
//     const φ1 = lat1 * Math.PI / 180; // Convert latitude from degrees to radians
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c; // Distance in meters
// };


// router.post('/locations', async (req, res) => {
//     try {
//         const { name, latitude, longitude } = req.body;
//         const location = new Location({ name, latitude, longitude });
//         await location.save();
//         res.status(201).json({ success: true, location });
//     } catch (error) {
//         console.error('Error adding location:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// // Get all locations
// router.get('/locations', async (req, res) => {
//     try {
//         const locations = await Location.find();
//         res.json({ success: true, locations });
//     } catch (error) {
//         console.error('Error fetching locations:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// // Get location by ID
// router.get('/locations/:id', async (req, res) => {
//     try {
//         const location = await Location.findById(req.params.id);
//         if (!location) {
//             return res.status(404).json({ success: false, message: 'Location not found' });
//         }
//         res.json({ success: true, location });
//     } catch (error) {
//         console.error('Error fetching location by ID:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// // Update location by ID
// router.put('/locations/:id', async (req, res) => {
//     try {
//         const { name, latitude, longitude } = req.body;
//         const location = await Location.findByIdAndUpdate(req.params.id, { name, latitude, longitude }, { new: true });
//         if (!location) {
//             return res.status(404).json({ success: false, message: 'Location not found' });
//         }
//         res.json({ success: true, location });
//     } catch (error) {
//         console.error('Error updating location:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

// // Delete location by ID
// router.delete('/locations/:id', async (req, res) => {
//     try {
//         const location = await Location.findByIdAndDelete(req.params.id);
//         if (!location) {
//             return res.status(404).json({ success: false, message: 'Location not found' });
//         }
//         res.json({ success: true, message: 'Location deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting location:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });

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