
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://tahir:112233test@auctionplatform.veyca.mongodb.net/testShehbaz?",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        console.log("DB is connected");
    } catch (error) {
        console.log("Error connecting to the database:", error.message);
    }
};

module.exports = connectDB;

