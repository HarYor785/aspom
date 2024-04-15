import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    postalCode: {
        type: Number,
    },
    country: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Open', 'Closed',],
        default: 'Open'
    }
});

const Location = mongoose.model('Location', locationSchema);

export default Location