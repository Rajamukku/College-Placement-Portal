const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interview', 'rejected', 'hired', 'hold'],
        default: 'applied',
    },
    dateApplied: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', ApplicationSchema);