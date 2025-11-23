const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/companies
 * @desc    Create a new company (Admin only)
 * @access  Private (Admin)
 */
exports.createCompany = async (req, res) => {
    const { name, email, password, companyId, website, description, industry, hrName, hrContact } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'User with this email already exists' 
            });
        }

        // Check if company ID is already taken
        const existingCompany = await Company.findOne({ companyId: companyId.trim().toUpperCase() });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'This company ID is already registered. Please use a different ID.'
            });
        }

        // Create new user
        user = new User({
            email: email.toLowerCase().trim(),
            password,
            role: 'company',
            isActive: true
        });

        // Save user (pre-save hook will hash password)
        await user.save();

        // Create company profile
        const company = new Company({
            user: user._id,
            companyId: companyId.trim().toUpperCase(),
            name: name.trim(),
            website: website?.trim(),
            description: description?.trim(),
            industry: industry?.trim(),
            hrName: hrName?.trim(),
            hrContact: hrContact?.trim(),
            isActive: true
        });
        await company.save();

        // Get the created company with user data
        const companyData = {
            _id: company._id,
            companyId: company.companyId,
            name: company.name,
            email: user.email,
            website: company.website,
            industry: company.industry,
            isActive: company.isActive,
            createdAt: company.createdAt
        };

        res.status(201).json({
            success: true,
            data: companyData,
            message: 'Company created successfully!'
        });
    } catch (error) {
        console.error('Error creating company:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                errors: messages 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'Duplicate key error. A company with this information already exists.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/companies
 * @desc    Get all companies (Admin only)
 * @access  Private (Admin)
 */
exports.getAllCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        // Build search query
        const searchQuery = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { companyId: { $regex: search, $options: 'i' } },
                { 'userData.email': { $regex: search, $options: 'i' } }
            ]
        };

        // Get companies with user data
        const [companies, total] = await Promise.all([
            Company.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                { $unwind: '$userData' },
                {
                    $match: searchQuery
                },
                {
                    $project: {
                        _id: 1,
                        companyId: 1,
                        name: 1,
                        email: '$userData.email',
                        website: 1,
                        industry: 1,
                        isActive: 1,
                        createdAt: 1
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            ]),
            Company.countDocuments(searchQuery)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            count: companies.length,
            total: total,
            currentPage: page,
            totalPages: totalPages,
            companies: companies
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch companies',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   GET /api/companies/me
 * @desc    Get the profile of the currently logged-in company
 * @access  Private (Company)
 */
exports.getCompanyProfile = async (req, res) => {
    try {
        // Validate req.user exists
        if (!req.user || !req.user.id) {
            console.error('User not authenticated or user ID missing');
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login again.'
            });
        }

        // Debug logging
        console.log('Fetching company profile for user:', req.user.id);
        console.log('User ID type:', typeof req.user.id);
        
        // Try to find company without populate first to check if it exists
        // MongoDB will handle ObjectId conversion automatically
        let company = await Company.findOne({ user: req.user.id }).select('-__v');
        
        if (!company) {
            console.log('Company not found for user:', req.user.id);
            return res.status(404).json({ 
                success: false,
                message: 'Company profile not found for this user. Please contact admin to create your company profile.' 
            });
        }
        
        // Populate user data separately with error handling
        try {
            await company.populate('user', ['email', 'isActive']);
        } catch (populateErr) {
            console.error('Error populating user:', populateErr);
            // Continue without populate - user data might be missing but company exists
        }
        
        console.log('Company profile found:', company.name);
        
        // Ensure the response has all required fields
        const companyData = {
            _id: company._id,
            companyId: company.companyId,
            name: company.name || '',
            email: company.user?.email || '',
            website: company.website || '',
            description: company.description || '',
            industry: company.industry || '',
            hrName: company.hrName || '',
            hrContact: company.hrContact || '',
            logoUrl: company.logoUrl || '',
            address: company.address || {},
            isActive: company.isActive !== undefined ? company.isActive : true,
            user: company.user ? {
                email: company.user.email,
                isActive: company.user.isActive
            } : null,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
        
        res.status(200).json({
            success: true,
            data: companyData
        });
    } catch (err) {
        console.error("Get Company Profile Error:", err);
        console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            userId: req.user?.id,
            errorName: err.name
        });
        res.status(500).json({
            success: false,
            message: 'Server Error while fetching company profile',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * @route   PUT /api/companies/profile
 * @desc    Update the profile of the currently logged-in company
 * @access  Private (Company)
 */
exports.updateCompanyProfile = async (req, res) => {
    try {
        const { name, website, description, industry, hrName, hrContact, address } = req.body;
        
        const updateFields = {};
        if (name) updateFields.name = name.trim();
        if (website) updateFields.website = website.trim();
        if (description) updateFields.description = description.trim();
        if (industry) updateFields.industry = industry.trim();
        if (hrName) updateFields.hrName = hrName.trim();
        if (hrContact) updateFields.hrContact = hrContact.trim();
        if (address) {
            updateFields.address = {};
            if (address.street) updateFields.address.street = address.street.trim();
            if (address.city) updateFields.address.city = address.city.trim();
            if (address.state) updateFields.address.state = address.state.trim();
            if (address.country) updateFields.address.country = address.country.trim();
            if (address.zipCode) updateFields.address.zipCode = address.zipCode.trim();
        }

        const company = await Company.findOneAndUpdate(
            { user: req.user.id },
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-__v')
         .populate('user', ['email', 'isActive']);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: company,
            message: 'Company profile updated successfully!'
        });
    } catch (error) {
        console.error('Update Company Profile Error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating company profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};