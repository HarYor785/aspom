import AuthUser from "../models/authModel.js"
import { assignJwt, comparePassword, hashPassword } from "../utils/index.js"
import multer from 'multer';
import path from 'path'
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library'
import Attendance from "../models/attendanceModel.js";
import Termination from "../models/terminationModel.js";
import Resignation from "../models/resignationModel.js";
import PasswordReset from "../models/resetPassModel.js";
import Verification from "../models/verificationModel.js";
import { sendVerificationMail, sendResetPassMail } from "../utils/mailer.js";
import LeaveBalance from "../models/leaveBalance.js";
import validator from 'validator';




export const signupAuth = async (req, res)=>{
    try {
        const {
            firstName,
            lastName,
            staffId,
            email,
            department,
            role,
            password
        } = req.body

        if(!firstName || !lastName || !staffId || !department || !role || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill out all fields"
            })
        }

        if (!email.endsWith('@aspomtravels.com')) {
            return res.status(403).json({
                success:false,  
                message:"Email must be from @aspomtravels.com domain" 
            });
        }

        const ifExistsMail = await AuthUser.findOne({email: email})
        const ifExistsStaffId = await AuthUser.findOne({staffId: staffId})

        if(ifExistsMail) {
            return res.status(403).json({
                success:false,  
                message:"Email address already exists!" 
            });
        }

        if(ifExistsStaffId) {
            return res.status(403).json({
                success:false,  
                message:"Staff ID already exists!" 
            });
        }

        const hash = await hashPassword(password)

        const user = new AuthUser({
            firstName,
            lastName,
            department,
            role,
            email,
            staffId,
            password : hash
        })
        
        await user.save()

        await sendVerificationMail(user, res)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

// Verification of user account through email verification link
export const verifyAccount = async (req, res) => {
    const { id, code } = req.params;

    try {
        const verificationRecord = await Verification.findOne({ userId: id });

        if (verificationRecord) {
            const validCode = verificationRecord.code === code

            if(!validCode){
                return res.status(403).json({
                    success: false,
                    message: 'Invalid verification code!'
                })
            }
            const { expiredAt } = verificationRecord;

            // Check if the verification link has expired
            if (expiredAt < Date.now()) {
                await Promise.all([
                    Verification.findOneAndDelete({ userId: id }),
                    AuthUser.findOneAndDelete({ _id: id }),
                ]);

                return res.status(401).json({
                    success: false,
                    message: "Verification code has expired",
                });
            }

            // Mark user as verified and remove verification record
            await Promise.all([
                AuthUser.findOneAndUpdate({ _id: id }, { verified: true }),
                Verification.findOneAndDelete({ userId: id }),
            ]);
            const balance = new LeaveBalance({
                user: id
            })

            await balance.save()

            return res.status(200).json({
                success: true,
                message: "Account verified successfully, You can now proceed to login",
            });

        } else {
            return res.status(402).json({
                success: false,
                message: "Invalid verification code, Try again",
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const loginAuth = async (req, res)=>{
    try {
        const {
            staffId,
            password
        } = req.body

        if(!staffId || !password){
            return res.status(403).json({
                success:false,
                message: 'Please enter all required fields.'
            })
        }

        const user = await AuthUser.findOne({staffId})
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Staff ID'
            })
        }

        const userId = user._id

        if(!user.verified){
            return res.status(403).json({
                success: false,
                message: 'Account is not verified yet! Please verify your account through the verification code sent to you via email',
                userId: userId
            })
        }

        const comparePass = await comparePassword(password, user.password)
        if (!comparePass) {
            return res.status(401).json({
                success: false,
                message: "Wrong Password"
            })
        }

        const inTermination = await Termination.findOne({user: user._id})
        const inResignation = await Resignation.findOne({user: user._id})
        
        // If the user is terminated, deny access
        if(inTermination || inResignation){
            return res.status(403).send({
                success: false,
                message: "Your account has been deactivated."
            });
        }

        const getUser = await AuthUser.findById(user._id).populate({
            path: 'attendance'
        }).populate({
            path: 'todolist'
        }).populate({
            path: 'reports'
        })
        getUser.password = undefined
        
        // create token
        let token = assignJwt(user._id, user.role)

        res.status(200).json({
            success: true,
            message: 'Login successfully',
            user: getUser,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params
        const {
            firstName,
            lastName,
            department,
            role,
            email,
            phone,
            gender,
            birthDay,
            joinDate,
            street,
            state,
            country,
            accountName,
            accountNo,
            bankName,
            salaryAmount,
            salaryBasis,
            paymentType
        } = req.body
        const file = req.file

        const verifyUser = await AuthUser.findById(userId)

        if(!verifyUser){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const user = await AuthUser.findById(id)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        // Validate phone number
        if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid phone number' 
            });
        }

        // Update user's profile information
        user.firstName = firstName;
        user.lastName = lastName;
        user.department = department;
        user.role = role;
        user.email = email;
        user.phone = phone;
        user.gender = gender;
        user.birthDay = birthDay;
        user.joinDate = joinDate;

        if (!user.address) {
            user.address = {};
        }

        // Update user's address information
        user.address.street = street;
        user.address.state = state;
        user.address.country = country;

        if (!user.bankInfo) {
            user.bankInfo = {};
        }

        // Update user's payment information
        user.bankInfo.bankName = bankName;
        user.bankInfo.accountName = accountName;
        user.bankInfo.accountNo = accountNo;
        user.bankInfo.salaryAmount = salaryAmount !== undefined ? salaryAmount : '';
        user.bankInfo.salaryBasis = salaryBasis !== undefined ? salaryBasis : '';
        user.bankInfo.paymentType = paymentType !== undefined ? paymentType : '';

        if (file) {
            user.profilePic = file.filename;
        } else {
            user.profilePic = user.profilePic ? user.profilePic : ''
        }

        await user.save()
        
        const updatedUser = await AuthUser.findById(userId).populate({
            path: 'attendance'
        }).populate({
            path: 'todolist'
        }).populate({
            path: 'reports'
        })
        
        const token = assignJwt(updatedUser._id, updatedUser.role)

        updatedUser.password = undefined

        res.status(200).json({
            success: true,
            message: 'Profile Updated Successfuly',
            user: updatedUser,
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

export const addAdmin = async (req, res) =>{
    try{
        const {userId} = req.body.user

        const auth = await AuthUser.findById(userId)

        if(!auth || auth.role !== 'Administrator'){
            return res.status(403).json({
                successs: false,
                message: 'Authorization failed!'
            })
        }
        
        const {
            firstName,
            lastName,
            staffId,
            email,
            department,
            role,
            password
        } = req.body
        
        if(!firstName || !lastName || !staffId || !department || !role || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill out all fields"
            })
        }
        
        if (!email.endsWith('@aspomtravels.com')) {
            return res.status(403).json({
                success:false,  
                message:"Email must be from @aspomtravels.com domain" 
            });
        }

        const ifExistsMail = await AuthUser.findOne({email: email})
        const ifExistsStaffId = await AuthUser.findOne({staffId: staffId})

        if(ifExistsMail) {
            return res.status(403).json({
                success:false,  
                message:"Email address already exists!" 
            });
        }

        if(ifExistsStaffId) {
            return res.status(403).json({
                success:false,  
                message:"Staff ID already exists!" 
            });
        }

        const hash = await hashPassword(password)

        const user = new AuthUser({
            firstName,
            lastName,
            department,
            role,
            email,
            staffId,
            password : hash,
            verified: true
        })
        
        await user.save()

        res.status(200).json({
            success: true,
            message: 'New Administrator added successfully!'
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

export const getAdmins = async (req, res) => {
    try{
        const {userId} = req.body.user

        const auth = await AuthUser.findById(userId)

        if(!auth || auth.role !== 'Administrator'){
            return res.status(403).json({
                successs: false,
                message: 'Authorization failed!'
            })
        }

        const admins = await AuthUser.find({role: 'Administrator'})

        res.status(200).json({
            success: true,
            message: 'Administrator fetched successfully!',
            data: admins
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

export const getAcounts = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                successs: false,
                message: 'Authorization failed!'
            })
        }

        const users = await AuthUser.find({_id: {$ne: userId}}).populate('attendance')

        res.status(200).json({
            success: true,
            message: 'Accounts fetched!',
            data: users
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Internal Server error'
        })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                successs: false,
                message: 'Authorization failed!'
            })
        }
        
        const users = await AuthUser.find()
        .populate({path: 'todolist'})
        .select('firstName lastName role department staffId profilePic email gender createdAt')
        .sort({createdAt: -1})
        
        res.status(200).json({
            success: true,
            message: 'All Accounts fetched!',
            data: users
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Server error'
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params
        console.log(id)
        const user = await AuthUser.findById(id ? id : userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const addStaff = async (req, res) => {
    try{
        const {userId} = req.body.user
        const {firstName,
        lastName,
        email,
        staffId,
        password,
        phone,
        gender,
        birthDay,
        joinDate,
        department,
        role,
        } = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                successs: false,
                message: 'Authorization failed!'
            })
        }

        if(!firstName || !lastName || !email 
            || !staffId || !gender || !joinDate 
            || !department || !role){
                return res.status(401).json({
                    success: false,
                    message: 'Enter required fields!'
                })
        }

        const existId = await AuthUser.findOne({staffId: staffId})

        if(existId){
            return res.status(403).json({
                success: false,
                message: 'Employee ID already exist!'
            })
        }

        let userPassword;

        if(password){
            userPassword = await hashPassword(password)
        }

        const newUser = new AuthUser({
            firstName,
            lastName,
            staffId,
            email,
            department,
            role,
            gender,
            joinDate,
            birthDay: birthDay ? birthDay : '',
            phone: phone ? phone : '',
            password: userPassword ? userPassword : ''
        })

        await newUser.save()

        res.status(200).json({
            success: true,
            message: 'Employee added successfully!'
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: 'Server error'
        })
    }
}

export const forgotPassword = async (req, res) => {
    try{

        const {email} = req.body

        if(!email){
            return res.status(403).json({
                success: false,
                message: 'Enter required field!'
            })
        }
        const user = await AuthUser.findOne({email})

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Email address not found!'
            })
        }

        // Check if there is an existing password reset request for the user
        const existingRequest = await PasswordReset.findOne({ email: email });

        if (existingRequest) {
            // Check if the existing request is still valid (not expired)
            if (existingRequest.expiredAt > Date.now()) {
                return res.json({
                    success: false,
                    message: "Password reset request already sent",
                });
            }

            // If the request is expired, delete it to create a new one
            await PasswordReset.findOneAndDelete({ email });
        }

        await sendResetPassMail(user, res)
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

// Password reset link verification
export const passwordResetLink = async (req, res) => {
    const { id, token } = req.params;

    try {
        // Find the user by id
        const user = await AuthUser.findById(id);

        // Check if the user exists
        if (!user) {
            const message = "Invalid Password reset link, Try again.";
            return res.json({
                success: false,
                message: message,
            });
        }

        // Find the corresponding password reset record
        const passwordReset = await PasswordReset.findOne({ userId: id });

        // Check if the password reset record exists
        if (!passwordReset) {
            const message = "Invalid Password reset link, Try again.";
            return res.json({
                success: false,
                message: message,
            });
        }

        const { expiredAt, token: hashToken } = passwordReset;

        // Check if the password reset link has expired
        if (expiredAt < Date.now()) {
            const message = "Password reset link has expired.";
            return res.json({
                success: false,
                message: message,
            });
        } else {
            // Check if the provided token matches the stored hashToken
            const isMatch = await comparePassword(token, hashToken);

            if (!isMatch) {
                const message = "Invalid Password reset link, Try again.";
                return res.json({
                    success: false,
                    message: message,
                });
            } else {
                // If everything is valid, send success status and user id
                return res.json({
                    success: true,
                    id: id,
                });
            }
        }
    } catch (error) {
        console.log(error);
        const message = "Internal server error.";
        return res.json({
            success: "error",
            message: message,
        });
    }
};

export const resetPassword = async (req, res) => {
    try{
        const {id} = req.params
        const {password} = req.body
        
        const user = await AuthUser.findById(id)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Invalid ID!'
            })
        }

        const hash = await hashPassword(password)

        const update = await AuthUser.findByIdAndUpdate({_id: id},{
            password: hash
        },{new: true})

        if(!update){
            return res.status(403).json({
                success: false,
                message: 'Error updating password, try again!'
            })
        }

        await PasswordReset.findOneAndDelete({ userId: id });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully, proceed to login'
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {oldPassword, newPassword} = req.body
        
        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const compare = await comparePassword(oldPassword, user.password)

        if(!compare){
            return res.status(403).json({
                success: false,
                message: 'Incorrect old password!'
            })
        }

        const hash = await hashPassword(newPassword)

        const update = await AuthUser.findByIdAndUpdate({_id: userId},{
            password: hash
        },{new: true})

        if(!update){
            return res.status(403).json({
                success: false,
                message: 'Error updating password, try again!'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully!',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}