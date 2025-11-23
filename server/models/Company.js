const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    companyId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/, 'Please provide a valid website URL']
    },
    description: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    hrName: {
        type: String,
        trim: true
    },
    hrContact: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add compound index for better query performance
CompanySchema.index({ companyId: 1, name: 1 });

module.exports = mongoose.model('Company', CompanySchema);