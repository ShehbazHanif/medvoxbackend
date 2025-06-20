require('dotenv').config();
const express = require('express');
const userRouter = require('./scr/route/userRoute');
const app = express();
const connectDB = require('./scr/db/db');
const cookieParser = require('cookie-parser');
const otpRoute = require('./scr/route/otpRoute');
const profileRoute = require('./scr/route/profileRoute');
const questionnaireRouter = require('./scr/route/questionnaireRoute');
const PORT = process.env.PORT || 3000
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
connectDB();

app.use('/api', userRouter)
app.use('/api/otp', otpRoute)
app.use('/api/profile', profileRoute)
app.use('/api/questionnaire', questionnaireRouter)

app.listen(PORT, () => {
    console.log(`Server is live ${PORT}`);
})
