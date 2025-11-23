const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The connect() method returns a promise, so we await it.
        await mongoose.connect(process.env.MONGO_URI);
        
        // This line will ONLY run if the connection is successful.
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        // If an error occurs during connection, this block will run.
        console.error('🔴 MongoDB Connection Failed:', err.message); 
        
        // Exit the Node.js process with a failure code (1).
        // This is crucial because the app cannot run without a database.
        process.exit(1);
    }
};

module.exports = connectDB;