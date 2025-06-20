const questionnaireModel = require('../model/questionnaireModel');

const addQuestionnaire = async (req, res) => {
    try {
        const questionnaire = await questionnaireModel.create({
            user: req.user.id,
            ...req.body  // req.body already validated and transformed by Zod
        });

        res.status(201).json({
            success: true,
            message: "Questionnaire submitted successfully",
            data: questionnaire
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error submitting questionnaire",
            error: error.message
        });
    }
};
// Get questionnaire for logged-in user
const getQuestionnaire = async (req, res) => {
    try {
        const questionnaire = await questionnaireModel.findOne({ user: req.user.id });

        if (!questionnaire) {
            return res.status(404).json({ success: false, message: "No questionnaire found" });
        }

        res.status(200).json({
            success: true,
            message: "Questionnaire fetched successfully",
            data: questionnaire
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching questionnaire",
            error: error.message
        });
    }
};

module.exports = { addQuestionnaire, getQuestionnaire };
