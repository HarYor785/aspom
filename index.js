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
import Location from './models/locationModel.js'
import cron from 'node-cron'
import axios from 'axios'

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

// Function to round coordinates to a specified precision
const roundCoordinates = (coordinate) => {
    const precision = 4; // Adjust this precision as needed
    return parseFloat(coordinate).toFixed(precision);
};

const isWithinThreshold = (userLatitude, dbLatitude, threshold) => {
    const latDifference = Math.abs(userLatitude - dbLatitude);
    const toRoundedUp = latDifference.toFixed(4)
    return toRoundedUp <= threshold;
};

// Route to handle IP address and get user location
app.post('/access-location', async (req, res) => {
    try {
        const { ipAddress } = req.body;
        const userLocation = await fetchUserLocation(ipAddress);
        const allowedLocations = await Location.find({status: 'Open'});

        const isWithinThresholds = await Promise.all(allowedLocations.map(async (location) => {
            const roundedUserLatitude = roundCoordinates(userLocation.latitude);
            const roundedDBLatitude = roundCoordinates(location.latitude);

            const withinThreshold = isWithinThreshold(roundedUserLatitude, roundedDBLatitude, 0.001); // Adjust threshold as needed
            return withinThreshold;
        }));

        // console.log('isWithinThresholds ', isWithinThresholds);
        const isAccessGranted = isWithinThresholds.some(isWithinThreshold => isWithinThreshold);
        // console.log('Is access granted? ', isAccessGranted);

        if (isAccessGranted) {
            res.json({ access: true });
        } else {
            res.json({ access: false });
        }
    } catch (error) {
        console.error('Error fetching user location:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to fetch user location based on IP address using Axios
const fetchUserLocation = async (ipAddress) => {
    try {
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        const { latitude, longitude } = response.data;
        return { latitude, longitude };
    } catch (error) {
        console.error('Error fetching user location:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = lat1 * Math.PI / 180; // Convert latitude from degrees to radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    console.log('R', R)
    console.log('c', c)
    console.log('R * c', R * c)
    return R * c; // Distance in meters
};

app.get('/',(req, res)=>{
    res.send('You are live')
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