const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Log the MONGO_URI to verify it's being read correctly
// console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined. Please check your .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        // console.log(`Connecting to MongoDB at ${process.env.MONGO_URI}`);
        console.log("MongoDB connected....");
    } catch (err) {
        console.error(`Error: ${err.message}`);
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;