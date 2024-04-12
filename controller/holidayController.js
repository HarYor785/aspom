import AuthUser from "../models/authModel.js"
import Holiday from "../models/holidayModel.js"

export const createHoliday = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { name, date } = req.body;

        if(!name || !date){
            return res.status(403).json({
                success: false,
                message: 'Enter required field'
            })
        }

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const holiday = new Holiday({ name, date });

        await holiday.save();

        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


// Controller to get all holidays
export const getAllHolidays = async (req, res) => {
    try {
        const { userId } = req.body.user;

        const user = await AuthUser.findById(userId)
        
        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const holidays = await Holiday.find();

        res.status(200).json({
            success: true,
            data: holidays
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Controller to update a holiday by ID
export const updateHoliday = async (req, res) => {
    try {
        const { name, date } = req.body;
        const {id} = req.params;
        
        const holiday = await Holiday.findByIdAndUpdate(id, { name, date }, { new: true });
        
        if (!holiday) {
            return res.status(403).json({
                success: false,
                message: 'Holiday not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Holiday updated successfully',
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Could not update holiday',
            error: error.message
        });
    }
};


// Controller to delete a holiday by ID
export const deleteHoliday = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const {id} = req.params

        const user = await AuthUser.findById(userId)
        
        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const holiday = await Holiday.findByIdAndDelete(id);
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Holiday deleted successfully',
            data: holiday
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};