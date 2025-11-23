const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: String,
    description: String,
    link: String,
});

const InternshipSchema = new mongoose.Schema({
    company: String,
    role: String,
    duration: String,
    description: String,
});

const StudentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    phone: String,
    branch: String,
    resumeLink: String,
    academics: {
        tenth: String,
        twelfth: String,
        cpi: Number,
    },
    skills: [String],
    graduationYear: Number,
    activeBacklogs: { type: Number, default: 0 },
    projects: [ProjectSchema],
    internships: [InternshipSchema],
    achievements: [String],
    dateOfBirth: String,
    gender: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    linkedin: String,
    github: String,
    // New marksheets storage for 10th, Intermediate, and semester-wise PDFs and marks
    marksheets: {
        tenth: {
            percentage: { type: Number },
            pdfUrl: { type: String }
        },
        inter: {
            percentage: { type: Number },
            pdfUrl: { type: String }
        },
        cgpa: {
            value: { type: Number },
            pdfUrl: { type: String }
        },
        semesters: [
            {
                sem: Number,
                sgpa: Number,
                backlogs: { type: Number, default: 0 },
                pdfUrl: String
            }
        ]
    }
});

module.exports = mongoose.model('Student', StudentSchema);