const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contactNumber: { type: String, required: true },

    allergy: { type: String, default: "" },
    currentMedication: { type: String, default: "" },
    diabetes: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    smoke: { type: Boolean, default: false },
    drink: { type: Boolean, default: false },

    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], default: 'O+' },
    heartDisease: { type: Boolean, default: false },
    asthma: { type: Boolean, default: false },
    anySurgeryHistory: { type: String, default: "" },
    exerciseRegularly: { type: Boolean, default: false },
    dietType: { type: String, enum: ['Vegetarian', 'Non-vegetarian', 'Vegan'], default: 'Non-vegetarian' },
    sleepHours: { type: Number, default: 6 },
    mentalHealth: { type: String, default: "Stable" }
}, { timestamps: true });

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
