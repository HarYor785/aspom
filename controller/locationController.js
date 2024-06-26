import Location from '../models/locationModel.js'
import AuthUser from '../models/authModel.js'


export const addLocation = async (req, res) =>{
    try {
        const {userId} = req.body.user
        const { name, 
            latitude, 
            longitude, 
            address,
            city, 
            state, 
            postalCode, 
            country } = req.body;

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const location = new Location({ 
            name, 
            latitude, 
            longitude,
            street: address,
            city,
            state,
            postalCode,
            country
        });

        await location.save();
        
        res.status(200).json({ 
            success: true,
            message: 'Location added successfully!', 
            data: location 
        });
    } catch (error) {
        console.error('Error adding location:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

export const getLocations = async (req, res) => {
    try{
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const locations = await Location.find()

        res.status(200).json({  
            success: true, 
            message: 'Locations fetched successfully!',  
            data: locations  
        });

    }catch(error){
        console.log(error)
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

export const deleteLocation = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const location = await Location.findByIdAndDelete(req.params.id);
        if (!location) {
            return res.status(403).json({ 
                success: false, 
                message: 'Location not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Location deleted successfully' 
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

export const updateLocation = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const location = await Location.findById(req.params.id);

        if (!location) {
            return res.status(403).json({ 
                success: false, 
                message: 'Location not found' 
            });
        }

        if(location.status === 'Open'){
            location.status = 'Closed'
        }else{
            location.status = 'Open'
        }

        await location.save()

        res.status(200).json({ 
            success: true, 
            message: 'Location updated successfully' 
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}