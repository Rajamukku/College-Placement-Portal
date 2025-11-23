// File: server/controllers/adminController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');

// --- DASHBOARD & GENERAL ---

const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        const [totalStudents, totalCompanies, applications, placements] = await Promise.all([
            Student.countDocuments(),
            Company.countDocuments(),
            Application.countDocuments(),
            Application.countDocuments({ status: 'hired' })
        ]);
        res.json({ totalStudents, totalCompanies, applications, placements });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const getAllJobs = asyncHandler(async (req, res) => {
    try {
        const jobs = await Job.find().populate('company', 'name').sort({ datePosted: -1 });
        
        // Get applicant counts for each job
        const jobsWithApplicants = await Promise.all(
            jobs.map(async (job) => {
                const applicantCount = await Application.countDocuments({ job: job._id });
                return {
                    ...job.toObject(),
                    applicants: applicantCount
                };
            })
        );
        
        res.json(jobsWithApplicants);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- STUDENT MANAGEMENT ---

const getAllStudents = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const searchMatch = search ? { $or: [ { name: { $regex: search, $options: 'i' } }, { studentId: { $regex: search, $options: 'i' } }, { 'userData.email': { $regex: search, $options: 'i' } } ] } : {};
        const pipelineBase = [ { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } }, { $unwind: '$userData' }, { $match: searchMatch } ];
        const [students, totalResult] = await Promise.all([ Student.aggregate([ ...pipelineBase, { $project: { _id: 1, name: 1, email: '$userData.email', studentId: 1, branch: 1, phone: 1, isActive: '$userData.isActive', createdAt: '$userData.date' } }, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit } ]), Student.aggregate([...pipelineBase, { $count: 'total' }]) ]);
        const total = totalResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({ success: true, total, currentPage: page, totalPages, students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
});

const addStudent = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, studentId, branch } = req.body;

        if (!name || !email || !password || !studentId || !branch) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        const existingStudent = await Student.findOne({ studentId: studentId.trim() });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Student ID already exists' });
        }

        const user = new User({ email: email.toLowerCase().trim(), password, role: 'student', isActive: true });
        await user.save();

        const student = new Student({ user: user._id, name: name.trim(), studentId: studentId.trim(), branch: branch.trim() });
        await student.save();

        return res.status(201).json({ success: true, message: 'Student created successfully', data: { _id: student._id, name: student.name, email: user.email, studentId: student.studentId, branch: student.branch } });
    } catch (error) {
        console.error('Add Student Error:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating student' });
    }
});

const updateStudentByAdmin = asyncHandler(async (req, res) => {
    try {
        const { name, email, branch, phone, isActive } = req.body;
        const studentId = req.params.id;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (typeof name === 'string') student.name = name.trim();
        if (typeof branch === 'string') student.branch = branch.trim();
        if (typeof phone === 'string') student.phone = phone.trim();

        await student.save();

        if (email || typeof isActive === 'boolean') {
            const user = await User.findById(student.user);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Associated user not found' });
            }
            if (email) user.email = email.toLowerCase().trim();
            if (typeof isActive === 'boolean') user.isActive = isActive;
            await user.save();
        }

        return res.status(200).json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update Student Error:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating student' });
    }
});

const changeStudentPassword = asyncHandler(async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const user = await User.findById(student.user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Associated user account not found' });
        }
        user.password = newPassword; // pre-save hook will hash
        await user.save();
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change Student Password Error:', error);
        return res.status(500).json({ success: false, message: 'Server error while changing password' });
    }
});

const deleteStudent = asyncHandler(async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        if (student.user) {
            await User.findByIdAndDelete(student.user);
        }
        await Student.findByIdAndDelete(student._id);
        return res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete Student Error:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting student' });
    }
});

// --- COMPANY MANAGEMENT ---

const getAllCompanies = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const basePipeline = [ { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } }, { $unwind: '$userData' }, { $match: search ? { $or: [ { name: { $regex: search, $options: 'i' } }, { companyId: { $regex: search, $options: 'i' } }, { 'userData.email': { $regex: search, $options: 'i' } } ] } : {} } ];
        const countPipeline = [...basePipeline, { $count: 'total' }];
        const dataPipeline = [ ...basePipeline, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }, { $project: { _id: 1, user: '$userData', companyId: 1, name: 1, email: '$userData.email', website: 1, industry: 1, isActive: '$userData.isActive' } } ];
        const [countResult, companies] = await Promise.all([ Company.aggregate(countPipeline), Company.aggregate(dataPipeline) ]);
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({ success: true, count: companies.length, total, currentPage: page, totalPages, companies });
    } catch (error) {
        console.error('Error in getAllCompanies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch companies' });
    }
});

const addCompany = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, companyId, website, description, industry, hrName, hrContact } = req.body;
        if (!name || !email || !password || !companyId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const emailLower = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: emailLower });
        
        if (existingUser) {
            // Check if this is an orphaned company user (user exists but no company profile)
            if (existingUser.role === 'company') {
                const associatedCompany = await Company.findOne({ user: existingUser._id });
                if (!associatedCompany) {
                    // Orphaned user - delete it and proceed with creating new company
                    console.log(`Found orphaned company user for email ${emailLower}, deleting it...`);
                    await User.findByIdAndDelete(existingUser._id);
                } else {
                    // User has an associated company - this is a real conflict
                    return res.status(400).json({ 
                        success: false, 
                        message: `A company with email "${emailLower}" already exists. If you believe this is an error, please contact the administrator.` 
                    });
                }
            } else {
                // User exists with a different role (student or admin)
                return res.status(400).json({ 
                    success: false, 
                    message: `Email "${emailLower}" is already registered as a ${existingUser.role}. Please use a different email address.` 
                });
            }
        }
        
        const existingCompany = await Company.findOne({ companyId: companyId.trim().toUpperCase() });
        if (existingCompany) {
            return res.status(400).json({ success: false, message: 'Company ID already exists' });
        }

        // Explicitly mark role as modified to ensure it's saved correctly
        const user = new User({ 
            email: emailLower, 
            password, 
            role: 'company',  // Explicitly set role to 'company'
            isActive: true 
        });
        user.markModified('role'); // Ensure role is saved even if it's the same as default
        await user.save();
        
        // Verify the role was saved correctly by refetching from database
        const savedUser = await User.findById(user._id);
        if (!savedUser || savedUser.role !== 'company') {
            console.error(`ERROR: User role not saved correctly! Expected 'company', got '${savedUser?.role}' for email ${emailLower}`);
            // Force update the role directly in database
            await User.findByIdAndUpdate(user._id, { role: 'company' }, { runValidators: true });
            console.log(`Fixed: Updated role to 'company' for user ${emailLower}`);
        } else {
            console.log(`✓ Company user created successfully with role '${savedUser.role}' for email ${emailLower}`);
        }

        // Helper function to convert empty strings to undefined
        const cleanOptionalField = (value) => {
            const trimmed = value?.trim();
            return trimmed && trimmed.length > 0 ? trimmed : undefined;
        };

        const company = new Company({
            user: user._id,
            companyId: companyId.trim().toUpperCase(),
            name: name.trim(),
            website: cleanOptionalField(website),
            description: cleanOptionalField(description),
            industry: cleanOptionalField(industry),
            hrName: cleanOptionalField(hrName),
            hrContact: cleanOptionalField(hrContact),
        });
        await company.save();

        return res.status(201).json({ success: true, message: 'Company created successfully', data: { _id: company._id, name: company.name, email: user.email, website: company.website, industry: company.industry } });
    } catch (error) {
        console.error('Add Company Error:', error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ success: false, message: `Validation error: ${messages}` });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate entry. A company with this information already exists.' });
        }
        
        return res.status(500).json({ success: false, message: 'Server error while creating company', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
});

const getCompanyById = asyncHandler(async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate('user', 'email isActive');
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.status(200).json({ success: true, data: company });
    } catch (error) {
        console.error('Get Company By ID Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const updateCompany = asyncHandler(async (req, res) => {
    try {
        const { name, website, description, industry, hrName, hrContact } = req.body;
        
        // Helper function to convert empty strings to undefined
        const cleanOptionalField = (value) => {
            if (value === undefined || value === null) return undefined;
            const trimmed = value.trim();
            return trimmed && trimmed.length > 0 ? trimmed : undefined;
        };
        
        const updateFields = {};
        if (name !== undefined) updateFields.name = name.trim();
        if (website !== undefined) updateFields.website = cleanOptionalField(website);
        if (description !== undefined) updateFields.description = cleanOptionalField(description);
        if (industry !== undefined) updateFields.industry = cleanOptionalField(industry);
        if (hrName !== undefined) updateFields.hrName = cleanOptionalField(hrName);
        if (hrContact !== undefined) updateFields.hrContact = cleanOptionalField(hrContact);
        
        const company = await Company.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.status(200).json({ success: true, data: company, message: 'Company updated successfully!' });
    } catch (error) {
        console.error('Update Company Error:', error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ success: false, message: `Validation error: ${messages}` });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Duplicate entry. A company with this information already exists.' });
        }
        
        res.status(500).json({ success: false, message: 'Server error while updating company', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
});

const deleteCompany = asyncHandler(async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        // Cascade delete: remove jobs and the user account
        await Job.deleteMany({ company: company._id });
        if (company.user) {
            await User.findByIdAndDelete(company.user);
        }
        await Company.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Company deleted successfully!' });
    } catch (error) {
        console.error('Delete Company Error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting company' });
    }
});

const changeCompanyPassword = asyncHandler(async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        const user = await User.findById(company.user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Associated user account not found' });
        }
        user.password = newPassword; // Pre-save hook will hash it
        await user.save();
        res.status(200).json({ success: true, message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Change Company Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error while changing password' });
    }
});

// --- ADMIN SELF-MANAGEMENT ---
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Invalid input' });
    }
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ msg: 'Forbidden' });
    }
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    adminUser.password = newPassword; // pre-save hook hashes
    await adminUser.save();
    res.json({ msg: 'Password updated successfully' });
});


// --- EXPORTS ---
// FIXED: This now correctly exports all required functions, preventing the ReferenceError.
module.exports = {
  getDashboardStats,
  getAllJobs,
  getAllStudents,
  addStudent,
  updateStudentByAdmin,
  deleteStudent,
  changeStudentPassword,
  getAllCompanies,
  addCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  changeCompanyPassword,
  changePassword,
  // additional exports
};

// --- REPORTS ---
module.exports.getReportsCsv = asyncHandler(async (req, res) => {
    try {
        // Build a simple placements/applications CSV combining students and applications
        const applications = await Application.find()
            .populate('student', 'name studentId branch')
            .populate('job', 'title company')
            .lean();

        const rows = applications.map(a => ({
            studentName: a.student?.name || '',
            studentId: a.student?.studentId || '',
            branch: a.student?.branch || '',
            jobTitle: a.job?.title || '',
            status: a.status,
            dateApplied: a.dateApplied?.toISOString() || ''
        }));

        const parser = new Parser({ fields: ['studentName', 'studentId', 'branch', 'jobTitle', 'status', 'dateApplied'] });
        const csv = parser.parse(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="placement-report.csv"`);
        return res.status(200).send(csv);
    } catch (err) {
        console.error('Generate CSV error:', err);
        return res.status(500).json({ message: 'Failed to generate report' });
    }
});