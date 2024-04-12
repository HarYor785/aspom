import express from 'express'
import authRoute from './authRoute.js'
import attendanceRoute from './attendanceRoute.js'
import taskRoute from './taskRoute.js'
import chatRoute from './chatRoute.js'
import caseRoute from './caseRoute.js'
import forumRoute from './forumRoute.js'
import reportRoute from './reportRoute.js'
import leaveRoute from './leaveRoute.js'
import deptRoute from './deptRoute.js'
import termRoute from './termRoute.js'
import resignRoute from './resignRoute.js'
import payrollRoute from './payrollRoute.js'
import appraisalRoute from './appraisalRoute.js'
import holidayRoute from './holidayRoute.js'


const router = express.Router()

const route = '/api-v1'

router.use(`${route}/auth/`, authRoute)
router.use(`${route}/attendance/`, attendanceRoute)
router.use(`${route}/task/`, taskRoute)
router.use(`${route}/chat/`, chatRoute)
router.use(`${route}/case/`, caseRoute)
router.use(`${route}/post/`, forumRoute)
router.use(`${route}/report/`, reportRoute)
router.use(`${route}/leave/`, leaveRoute)
router.use(`${route}/appraisal/`, appraisalRoute)

// HR
router.use(`${route}/department/`, deptRoute)
router.use(`${route}/termination/`, termRoute)
router.use(`${route}/resignation/`, resignRoute)
router.use(`${route}/payroll/`, payrollRoute)
router.use(`${route}/holiday/`, holidayRoute)



export default router