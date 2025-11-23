const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    package: String,
    eligibility: String,
    skills: String,
    deadline: Date,
    status: { type: String, enum: ['Live', 'Closed'], default: 'Live' },
    datePosted: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', JobSchema);