import mongoose from "mongoose";


const appraisalSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true
    },
    appraisal: [
        {
            kra: {
                type: String
            },
            kpi: [
                {
                    name: {
                        type: String
                    },
                    score: [
                        {
                            user: {
                                type: String
                            },
                            hr: {
                                type: String
                            },
                            admin: {
                                type: String
                            }
                        }
                    ]
                }
            ]
        }
    ],
    achievement: {
            type: String
        },
    innovation: {
        type: String
    },
    hrComment: {
        type: String
    },
    mpComment: {
        type: String
    },
},{timestamps: true})

const Appraisal = mongoose.model('Appraisal', appraisalSchema)

export default Appraisal