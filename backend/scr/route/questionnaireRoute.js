const express = require('express');
const questionnaireRouter = express.Router();
const { addQuestionnaire, getQuestionnaire } = require('../controller/questionnaireController');
const { authenticateToken } = require('../middleware/auth')
const { validateSchema, questionnaireSchema } = require('../middleware/validation')
questionnaireRouter.post('/addQuestionnaire', validateSchema(questionnaireSchema), authenticateToken, addQuestionnaire);
questionnaireRouter.get('/getQuestionnaire', authenticateToken, getQuestionnaire);
module.exports = questionnaireRouter;
