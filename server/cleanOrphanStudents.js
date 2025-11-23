// File: server/scripts/cleanOrphanStudents.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

dotenv.config({ path: '../.env' }); // Make sure the path to your .env is correct

const cleanOrphanUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected...');

        // 1. Get all user IDs that have the role 'student'
        const studentUsers = await User.find({ role: 'student' }).select('_id');
        const studentUserIds = new Set(studentUsers.map(u => u._id.toString()));
        console.log(`Found ${studentUserIds.size} users with role 'student'.`);

        // 2. Get all user IDs that are referenced in the Student collection
        const linkedStudents = await Student.find({}).select('user');
        const linkedUserIds = new Set(linkedStudents.map(s => s.user.toString()));
        console.log(`Found ${linkedUserIds.size} student profiles linked to users.`);

        // 3. Find the difference (users that are orphans)
        const orphanUserIds = [];
        studentUserIds.forEach(userId => {
            if (!linkedUserIds.has(userId)) {
                orphanUserIds.push(userId);
            }
        });

        if (orphanUserIds.length === 0) {
            console.log('✅ No orphan student users found. Your data is clean!');
            return;
        }

        console.log(`Found ${orphanUserIds.length} orphan student users to delete:`, orphanUserIds);

        // 4. Delete the orphan users
        const deleteResult = await User.deleteMany({ _id: { $in: orphanUserIds } });
        console.log(`🔥 Successfully deleted ${deleteResult.deletedCount} orphan users.`);

    } catch (error) {
        console.error('🔴 Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        process.exit();
    }
};

cleanOrphanUsers();