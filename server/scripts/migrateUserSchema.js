const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/placement-portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', async () => {
    try {
        console.log('Connected to MongoDB');
        
        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to update`);
        
        let updatedCount = 0;
        
        // Update each user with default values for new fields
        for (const user of users) {
            // Only update if the user doesn't have the name field
            if (!user.name) {
                // Try to extract name from email as a fallback
                const nameFromEmail = user.email.split('@')[0];
                user.name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
                
                // Set default values for other required fields
                if (!user.studentId) {
                    user.studentId = `STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }
                
                if (!user.branch && !user.department) {
                    user.department = 'Computer Science'; // Default department
                }
                
                await user.save();
                updatedCount++;
                console.log(`Updated user: ${user.email}`);
            }
        }
        
        console.log(`\nMigration complete! Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
