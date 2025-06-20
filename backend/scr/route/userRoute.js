const express = require('express');
const userRouter = express.Router();

const { handleUserRegister, handleLoginUser } = require('../controller/userController');
const { userCreateSchema, userLoginSchema, validateSchema } = require('../middleware/validation');

// Apply validation middleware properly
userRouter.post('/userRegister', validateSchema(userCreateSchema), handleUserRegister);
userRouter.post('/loginUser', validateSchema(userLoginSchema), handleLoginUser);

module.exports = userRouter;