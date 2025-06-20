require('dotenv').config();
const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Without changing any response format optimize this wrt to queries and load handling 
const handleUserRegister = async (req, res) => {
    const { name, email, password, } = req.body;
 
    try {  
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exist", success: false })
        }
   
        const hashPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashPassword
        })
        res.status(200).json({ok:true,
            success:true,
            message:"User Create SuccessFully",
            user
        })
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
const handleLoginUser = async (req, res) => {
    const { email, password } = req.body;
   

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(500).json({ error: "User not found" });
        }


        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }


        const tokenExpiration = process.env.EXPIRE_DAY || "1d";


        const accessToken = jwt.sign(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            process.env.SECRET_KEY,
            {
                expiresIn: tokenExpiration,
            }
        );

        const option = {
            httpOnly: true,
            secure: true,
        };


        res.status(201)
            .cookie("accessToken", accessToken, option)
            .json({
                accessToken,
                userId: user.id,
                message: "Login successfully",
                success: true,
            });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { handleUserRegister, handleLoginUser };
