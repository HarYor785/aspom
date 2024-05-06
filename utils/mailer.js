import nodemailer from 'nodemailer'
import {v4 as uuidv4} from 'uuid'
import dotenv from 'dotenv'
import PasswordReset from "../models/resetPassModel.js"
import Verification from "../models/verificationModel.js";
import {hashPassword} from './index.js'


dotenv.config()

const APP__URL = process.env.APP_URL
const NAME = process.env.MAILER__NAME
const PASS = process.env.MAILER__PASSWORD

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'Gmail',
    port: '587',
    auth:{
        user: NAME,
        pass: PASS
    }
})


export const sendVerificationMail = async (user, res)=>{
    const {id, email} = user
    const uuid = uuidv4()
    const code = uuid.slice(0, 6)
    try {
        const mailOption = {
            from: 'Aspom Travels Agency',
            to: email,
            subject: 'Intranet Registration - Email Verification Code',
            html:`<div style="display:flex;flex-direction: column;
            gap: 0.2rem;align-items: start;background: #fff;padding: 0.5rem;">
                <h3 style="font-weight: bolder;">Dear ${user.firstName + ' ' + user.lastName}</h3>
                    <p>
                        To complete the registration process and gain access to the intranet, 
                        kindly use the verification code below: 
                    </p> 
                    <p style="padding: 0.65rem 2rem;
                    background: rgb(2,49,157);border-radius: 5px;color: #fff;
                    text-decoration: none; margin-top: 0.5rem; margin-bottom: 0.5rem;">
                        ${code}
                    </p> 

                    <p>For security reasons, this code expire in <b>1 Hour</b></p>

                    <p>
                        If you encounter any issues or have any questions, please don't hesitate
                        to contact the IT Department for assistance at <strong>it@aspomtravels.com</strong>
                    </p> 
                    <div style="display: flex; flex-direction: column;padding-top: 1rem;">
                        <p>Best regards,</p>
                        <p>IT Team</p>
                        <img src={${APP__URL}/assets/Aspom-Logo.png} alt="Logo" 
                        style="width: 6rem; height: 6rem;"/>
                        <h3>ASPOM TRAVEL AGENCY</h3>
                        <p><strong>Head Office:</strong/> 69 Admiralty Way, Lekki Phase 1, Lagos Nigeria</p>
                        <p><strong>Abuja Office:</strong> Aiivon Innovation Hub, 167 Adetokunbo Ademola Cresent Wuse, Abuja.</p>
                        <p><strong>Ikeja Office:</strong> Pentagon Plaza, 23, Opebi Road, Ikeja, Lagos, Nigeria</p>
                    </div>
            </div>`
        }

        const mailVerification = await Verification.create({
            userId: id,
            code: code,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000
        })

        if(mailVerification){
            transporter.sendMail(mailOption)
            .then(()=>{
                res.status(200).json({
                    success: true,
                    message: "Verification code has been sent to your email address",
                    userId: id
                })
            })
            .catch((error)=>{
                console.log(error)
                res.status(402).json({
                    success: false,
                    message: "There's an error sending verification code, try again!"
                })
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "There's an error sending verification code, try again!"
        })
    }
}

export const sendLeaveNotification = async (supervisorMail, user, res, roles, staff)=>{
    const link = `${APP__URL}/employees_leave_request`
    try {
        const mailOption = {
            from: 'Aspom Travels Agency',
            to: supervisorMail,
            subject: 'Leave Request Notification - Aspom Travels Agency',
            html:`<div style="display:flex;flex-direction: column;
            gap: 0.2rem;align-items: start;background: #fff;padding: 0.5rem;">
                ${
                    roles === 'admin' ? `
                        <h3 style="font-weight: bolder;">Dear Administrator</h3>
                        <p>
                        I hope this message finds you well. I am writing to inform you 
                        that a leave request has been approved and requires 
                        your attention for final approval.
                        </p>
                        <p>
                        The leave request has been thoroughly reviewed and endorsed by 
                        the respective Supervisor and HR personnel. As the Administrator, 
                        your approval is the final step in the process.
                        </P>
                        <p>Please take a moment to review the details of the leave request and 
                        provide your approval at your earliest convenience.</p>
                        <p>Please follow this link to view the details of the leave request:</p>
                        <a href="${link}" target="_blank" style="padding: 0.65rem 2rem;
                        background: rgb(2,49,157);border-radius: 5px;color: #fff;
                        text-decoration: none;text-transform: uppercase;
                        margin-top: 0.5rem; margin-bottom: 0.5rem;">Click  here to proceed</a>
                    ` : roles === 'self' ? `
                    <h3 style="font-weight: bolder;">Dear ${user.firstName + ' ' + user?.lastName}</h3>
                    <p>I am pleased to inform you that your leave request has been approved by 
                    the Administrator. You are now cleared to proceed with your 
                    planned leave as scheduled.</p>
                    `  
                    :`
                    <h3 style="font-weight: bolder;">Dear ${roles}</h3>
                    <p>
                        A leave request has been submitted by ${user.firstName + ' ' + user?.lastName}. Please review it.
                    </p> 
                    `
                }
                
                    <br/><br/>
                    <p>
                        If you encounter any issues or have any questions, please don't hesitate
                        to contact the IT Department for assistance at <strong>it@aspomtravels.com</strong>
                    </p> 
                    <div style="display: flex; flex-direction: column;padding-top: 1rem;">
                        <p>Best regards,</p>
                        <p>IT Team</p>
                        <img src={${APP__URL}/assets/Aspom-Logo.png} alt="Logo" 
                        style="width: 6rem; height: 6rem;"/>
                        <h3>ASPOM TRAVEL AGENCY</h3>
                        <p><strong>Head Office:</strong/> 69 Admiralty Way, Lekki Phase 1, Lagos Nigeria</p>
                        <p><strong>Abuja Office:</strong> Aiivon Innovation Hub, 167 Adetokunbo Ademola Cresent Wuse, Abuja.</p>
                        <p><strong>Ikeja Office:</strong> Pentagon Plaza, 23, Opebi Road, Ikeja, Lagos, Nigeria</p>
                    </div>
            </div>`
        }

        const message = staff ? 'Leave request submitted successfully!' : 'Leave Updated successfully!'

        transporter.sendMail(mailOption)
        .then(()=>{
            res.status(200).json({
                success: true,
                message: message,
            })
        })
        .catch((error)=>{
            console.log(error)
            res.status(402).json({
                success: false,
                message: "There's an error, try again!"
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "There's an error sending verification code, try again!"
        })
    }
}

export const rejectLeaveNotification = async (user, res)=>{
    try {
        const mailOption = {
            from: 'Aspom Travels Agency',
            to: user?.email,
            subject: `Leave Request Notification - Your leave application was rejected`,
            html:`<div style="display:flex;flex-direction: column;
            gap: 0.2rem;align-items: start;background: #fff;padding: 0.5rem;">
                    <h3 style="font-weight: bolder;">Dear ${user.firstName + ' ' + user?.lastName}</h3>
                    <p>I regret to inform you that your leave request has been rejected</p>
                    <br/><br/>
                    <p>
                        If you encounter any issues or have any questions, please don't hesitate
                        to contact the IT Department for assistance at <strong>it@aspomtravels.com</strong>
                    </p> 
                    <div style="display: flex; flex-direction: column;padding-top: 1rem;">
                        <p>Best regards,</p>
                        <p>IT Team</p>
                        <img src={${APP__URL}/assets/Aspom-Logo.png} alt="Logo" 
                        style="width: 6rem; height: 6rem;"/>
                        <h3>ASPOM TRAVEL AGENCY</h3>
                        <p><strong>Head Office:</strong/> 69 Admiralty Way, Lekki Phase 1, Lagos Nigeria</p>
                        <p><strong>Abuja Office:</strong> Aiivon Innovation Hub, 167 Adetokunbo Ademola Cresent Wuse, Abuja.</p>
                        <p><strong>Ikeja Office:</strong> Pentagon Plaza, 23, Opebi Road, Ikeja, Lagos, Nigeria</p>
                    </div>
            </div>`
        }

        const message = 'Leave Updated successfully!'

        transporter.sendMail(mailOption)
        .then(()=>{
            res.status(200).json({
                success: true,
                message: message,
            })
        })
        .catch((error)=>{
            console.log(error)
            res.status(402).json({
                success: false,
                message: "There's an error, try again!"
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "There's an error sending verification code, try again!"
        })
    }
}

export const sendResetPassMail = async (user, res)=>{
    const {id, email} = user
    const token = id + uuidv4()
    const link = `${APP__URL}/auth/reset-password/${id}/${token}`;
    try {
        const mailOption = {
            from: 'Aspom Travels Agency',
            to: email,
            subject: 'RESET PASSWORD LINK',
            html:`<div style="display:flex;flex-direction: column;
            gap: 0.2rem;align-items: start;background: #fff;padding: 0.5rem;">
                <h3 style="font-weight: bolder;">Hello ${user.firstName + ' ' + user.lastName}</h3>
                    <p>We received a request to reset your password for your account</p> 
                    <p>To reset your password, click the link button below:</p> 
                    <a href="${link}" target="_blank" style="padding: 0.65rem 2rem;
                    background: rgb(2,49,157);border-radius: 5px;color: #fff;
                    text-decoration: none;text-transform: uppercase;
                    margin-top: 0.5rem; margin-bottom: 0.5rem;">Reset Password</a>
                    <p>If you did not request this change, please ignore this email. 
                    Your password will remain unchanged.</p> 
                    <p>For security reasons, this link will expire after <b>1 Hour</b></p>
                    <p>If you have any questions or need further assistance, 
                    please don't hesitate to contact the IT Team at <strong>it@aspomtravels.com</strong>.</p>
                    <div style="display: flex; flex-direction: column;padding-top: 1rem;">
                        <p>Best regards,</p>
                        <p>IT Team</p>
                        <img src={${APP__URL}/assets/Aspom-Logo.png} alt="Logo" 
                        style="width: 6rem; height: 6rem;"/>
                        <h3>ASPOM TRAVEL AGENCY</h3>
                        <p><strong>Head Office:</strong/> 69 Admiralty Way, Lekki Phase 1, Lagos Nigeria</p>
                        <p><strong>Abuja Office:</strong> Aiivon Innovation Hub, 167 Adetokunbo Ademola Cresent Wuse, Abuja.</p>
                        <p><strong>Ikeja Office:</strong> Pentagon Plaza, 23, Opebi Road, Ikeja, Lagos, Nigeria</p>
                    </div>
            </div>`
        }

        const hashToken = await hashPassword(token)

        const passwordReset = await PasswordReset.create({
            userId: id,
            email: email,
            token: hashToken,
            createdAt: Date.now(),
            expiredAt: Date.now() + 600000,
        })

        if(passwordReset){
            transporter.sendMail(mailOption)
            .then(()=>{
                res.status(200).json({
                    success: true,
                    message: "Password reset link has been sent to your email address"
                })
            })
            .catch((error)=>{
                console.log(error)
                res.status(402).json({
                    success: false,
                    message: "There's an error sending mail, try again!"
                })
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "There's an error sending mail, try again!"
        })
    }
}

export const sendCaseMail = async (email, newCase)=>{
    try {
        const mailOption = {
            from: 'Aspom Travels Agency',
            to: email,
            subject: `New Case Assigned: ${newCase?.title}`,
            html:`<div style="display:flex;flex-direction: column;
            gap: 0.2rem;align-items: start;background: #fff;padding: 0.5rem;">
                <h3 style="font-weight: bolder;">Dear ${newCase?.department}</h3>
                    <p>
                        A new case has been assigned to your department.
                    </p> 

                    <p>Please review the case and take appropriate action.</p>

                    <p>
                        If you encounter any issues or have any questions, please don't hesitate
                        to contact the IT Department for assistance at <strong>it@aspomtravels.com</strong>
                    </p> 
                    <div style="display: flex; flex-direction: column;padding-top: 1rem;">
                        <p>Best regards,</p>
                        <p>IT Team</p>
                        <img src={${APP__URL}/assets/Aspom-Logo.png} alt="Logo" 
                        style="width: 6rem; height: 6rem;"/>
                        <h3>ASPOM TRAVEL AGENCY</h3>
                        <p><strong>Head Office:</strong/> 69 Admiralty Way, Lekki Phase 1, Lagos Nigeria</p>
                        <p><strong>Abuja Office:</strong> Aiivon Innovation Hub, 167 Adetokunbo Ademola Cresent Wuse, Abuja.</p>
                        <p><strong>Ikeja Office:</strong> Pentagon Plaza, 23, Opebi Road, Ikeja, Lagos, Nigeria</p>
                    </div>
            </div>`
        }

        transporter.sendMail(mailOption)
        .then(()=>{
            console.log('Case mail sent')
        })
        .catch((error)=>{
            console.log(error)
        })

    } catch (error) {
        console.log(error)
    }
}