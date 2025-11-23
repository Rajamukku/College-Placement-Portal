const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

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
        console.log(`Found ${users.length} users to process`);
        
        let updatedCount = 0;
        let studentCount = 0;
        
        // Process each user
        for (const user of users) {
            // If user has studentId, move to Student model
            if (user.studentId) {
                // Check if student already exists
                const existingStudent = await Student.findOne({ studentId: user.studentId });
                
                if (!existingStudent) {
                    // Create new student record
                    const newStudent = new Student({
                        user: user._id,
                        name: user.name || user.email.split('@')[0],
                        studentId: user.studentId,
                        branch: user.branch || 'Computer Science',
                        phone: user.phone || '',
                        // Add other fields with default values if needed
                    });
                    
                    await newStudent.save();
                    studentCount++;
                    console.log(`Created student profile for ${user.email}`);
                }
                
                // Clean up user document
                const update = {
                    $unset: {
                        name: "",
                        studentId: "",
                        branch: "",
                        department: "",
                        phone: ""
                    }
                };
                
                await User.updateOne({ _id: user._id }, update);
                updatedCount++;
                console.log(`Cleaned up user document for ${user.email}`);
            }
            
            // Ensure password is hashed
            if (user.password && !user.password.startsWith('$2a$') && user.password.length < 60) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                await user.save();
                console.log(`Updated password hash for ${user.email}`);
                updatedCount++;
            }
        }
        
        console.log(`\nMigration complete!`);
        console.log(`- Updated ${updatedCount} user documents`);
        console.log(`- Created ${studentCount} new student profiles`);
        
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
