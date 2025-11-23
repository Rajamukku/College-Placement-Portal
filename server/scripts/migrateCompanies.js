const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('MongoDB Connected...');
    migrateCompanies();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

/**
 * Generate a unique company ID in the format: CMP-XXXXX
 * where X is a random alphanumeric character
 */
function generateCompanyId() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'CMP-';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Check if a company ID already exists in the database
 */
async function isCompanyIdUnique(companyId) {
    const count = await Company.countDocuments({ companyId });
    return count === 0;
}

/**
 * Generate a unique company ID that doesn't exist in the database
 */
async function getUniqueCompanyId() {
    let companyId;
    let isUnique = false;
    
    while (!isUnique) {
        companyId = generateCompanyId();
        isUnique = await isCompanyIdUnique(companyId);
    }
    
    return companyId;
}

/**
 * Migrate existing companies to the new schema
 */
async function migrateCompanies() {
    try {
        console.log('Starting company migration...');
        
        // Find all companies that need migration
        const companiesNeedingMigration = await Company.find({
            $or: [
                { companyId: { $exists: false } },
                { companyId: { $eq: null } },
                { companyId: { $eq: '' } }
            ]
        });
        
        console.log(`Found ${companiesNeedingMigration.length} companies to migrate`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const company of companiesNeedingMigration) {
            try {
                // Skip if company already has a valid companyId
                if (company.companyId && company.companyId.match(/^CMP-[A-Z0-9]{5}$/)) {
                    console.log(`Skipping company ${company._id} - already has valid companyId`);
                    skippedCount++;
                    continue;
                }
                
                // Generate a new unique company ID
                const companyId = await getUniqueCompanyId();
                
                // Update the company with the new companyId
                company.companyId = companyId;
                await company.save();
                
                console.log(`Migrated company ${company._id} with companyId: ${companyId}`);
                migratedCount++;
                
            } catch (error) {
                console.error(`Error migrating company ${company._id}:`, error.message);
            }
        }
        
        console.log('\nMigration Summary:');
        console.log(`- Total companies processed: ${companiesNeedingMigration.length}`);
        console.log(`- Successfully migrated: ${migratedCount}`);
        console.log(`- Skipped (already migrated): ${skippedCount}`);
        console.log(`- Failed: ${companiesNeedingMigration.length - migratedCount - skippedCount}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error during company migration:', error);
        process.exit(1);
    }
}
