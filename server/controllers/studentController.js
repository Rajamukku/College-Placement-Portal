const Job = require('../models/Job');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @route   GET /api/student/jobs
 * @desc    Get all jobs with 'Live' status for students to browse
 * @access  Private (Student)
 */
exports.getAllLiveJobs = async (req, res) => {
    try {
        // Find jobs and populate the 'company' field to get company name and logo
        const jobs = await Job.find({ status: 'Live' })
            .populate('company', 'name logoUrl') // Select only name and logoUrl from Company
            .sort({ deadline: 1 }); // Sort by soonest deadline first
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @route   POST /api/student/jobs/:jobId/apply
 * @desc    Allow a student to apply for a job
 * @access  Private (Student)
 */
exports.applyForJob = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ msg: 'Student profile not found.' });
        }

        const jobId = req.params.jobId;

        // Check if the student has already applied for this job
        const existingApplication = await Application.findOne({ student: student.id, job: jobId });
        if (existingApplication) {
            return res.status(400).json({ msg: 'You have already applied for this job.' });
        }

        const newApplication = new Application({ student: student.id, job: jobId });
        await newApplication.save();
        
        res.status(201).json({ msg: 'Application submitted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @route   GET /api/students/me
 * @desc    Get current student's profile
 * @access  Private (Student)
 */
exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .select('-__v -createdAt -updatedAt')
            .populate('user', 'email isActive');

        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student profile not found' 
            });
        }

        res.status(200).json({
            success: true,
            student: {
                ...student.toObject(),
                email: student.user.email,
                isActive: student.user.isActive,
                user: undefined // Remove the nested user object
            }
        });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile
 * @access  Private (Student)
 */
exports.updateStudentProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Log validation errors for debugging
        console.log('Validation errors:', errors.array());
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        // Format validation errors to be compatible with frontend
        const formattedErrors = errors.array().map(err => ({
            param: err.param,
            msg: err.msg || 'Invalid value',
            value: err.value
        }));
        
        // Get the first error message for easy display
        const firstError = formattedErrors[0];
        const errorMessage = firstError?.msg || 'Validation failed. Please check your input.';
        
        console.log('Returning validation error:', errorMessage);
        
        return res.status(400).json({ 
            success: false, 
            message: errorMessage,
            errors: formattedErrors 
        });
    }

        // Extract only fields that students can update (exclude immutable fields like name, studentId)
        const {
        phone,
        branch,
        resumeLink,
        academics,
        skills,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        pincode,
        linkedin,
        github,
        name, // Ignore if sent - students can't change name
        studentId // Ignore if sent - students can't change studentId
    } = req.body;
    
    // Log what's being sent for debugging (remove in production if needed)
    console.log('Updating student profile for user:', req.user.id);

    try {
        // Find the student profile
        let student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student profile not found' 
            });
        }

        // Helper function to clean optional fields (convert empty strings to undefined)
        const cleanOptionalField = (value) => {
            if (value === undefined || value === null || value === '') return undefined;
            return typeof value === 'string' ? value.trim() : value;
        };

        // Helper function to clean URLs (add protocol if missing, remove trailing slashes)
        const cleanURL = (value) => {
            const cleaned = cleanOptionalField(value);
            if (!cleaned) return undefined;
            // Remove trailing slashes (cleanOptionalField already trims whitespace)
            let trimmed = cleaned.replace(/\/+$/, '');
            // If it already has a protocol, return as is
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return trimmed;
            }
            // Add https:// if no protocol
            return `https://${trimmed}`;
        };

        // Update student fields
        const studentFields = {};
        // Students cannot change immutable fields: name, studentId
        
        // Clean and set fields only if they have valid values
        if (phone !== undefined) {
            const cleanedPhone = cleanOptionalField(phone);
            if (cleanedPhone) {
                // Remove spaces, dashes, and parentheses for storage (matching validation)
                studentFields.phone = cleanedPhone.replace(/[\s\-()]/g, '');
            } else {
                studentFields.phone = undefined; // Allow clearing the field
            }
        }
        
        if (branch !== undefined) studentFields.branch = cleanOptionalField(branch);
        if (resumeLink !== undefined) studentFields.resumeLink = cleanOptionalField(resumeLink);
        if (dateOfBirth !== undefined) studentFields.dateOfBirth = cleanOptionalField(dateOfBirth);
        if (gender !== undefined) studentFields.gender = cleanOptionalField(gender);
        if (address !== undefined) studentFields.address = cleanOptionalField(address);
        if (city !== undefined) studentFields.city = cleanOptionalField(city);
        if (state !== undefined) studentFields.state = cleanOptionalField(state);
        if (pincode !== undefined) {
            const cleanedPincode = cleanOptionalField(pincode);
            if (cleanedPincode) {
                studentFields.pincode = cleanedPincode.toString().trim();
            } else {
                studentFields.pincode = undefined;
            }
        }
        if (linkedin !== undefined) studentFields.linkedin = cleanURL(linkedin);
        if (github !== undefined) studentFields.github = cleanURL(github);
        
        // Update academics if provided - convert to proper types
        if (academics && typeof academics === 'object' && Object.keys(academics).length > 0) {
            const cleanedAcademics = {};
            
            // Handle tenth - convert to string (model expects String)
            if (academics.tenth !== undefined && academics.tenth !== '' && academics.tenth !== null) {
                const tenthVal = typeof academics.tenth === 'number' ? academics.tenth : parseFloat(academics.tenth);
                if (!isNaN(tenthVal)) {
                    cleanedAcademics.tenth = tenthVal.toString();
                }
            }
            
            // Handle twelfth - convert to string (model expects String)
            if (academics.twelfth !== undefined && academics.twelfth !== '' && academics.twelfth !== null) {
                const twelfthVal = typeof academics.twelfth === 'number' ? academics.twelfth : parseFloat(academics.twelfth);
                if (!isNaN(twelfthVal)) {
                    cleanedAcademics.twelfth = twelfthVal.toString();
                }
            }
            
            // Handle cpi - convert to number (model expects Number)
            if (academics.cpi !== undefined && academics.cpi !== '' && academics.cpi !== null) {
                const cpiValue = typeof academics.cpi === 'number' ? academics.cpi : parseFloat(academics.cpi);
                if (!isNaN(cpiValue)) {
                    cleanedAcademics.cpi = cpiValue;
                }
            }
            
            // Only update academics if we have at least one valid field
            if (Object.keys(cleanedAcademics).length > 0) {
                // Merge with existing academics to preserve fields not being updated
                studentFields.academics = {
                    ...(student.academics || {}),
                    ...cleanedAcademics
                };
            }
        }

        // Update skills if provided
        if (skills !== undefined) {
            if (Array.isArray(skills)) {
                // Filter out empty strings and remove duplicates
                studentFields.skills = [...new Set(skills.filter(s => s && s.trim()))];
            } else {
                studentFields.skills = [];
            }
        }

        // Remove undefined values to avoid setting them to null
        Object.keys(studentFields).forEach(key => {
            if (studentFields[key] === undefined) {
                delete studentFields[key];
            }
        });

        // Update the student profile
        student = await Student.findOneAndUpdate(
            { user: req.user.id },
            { $set: studentFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            student
        });

    } catch (error) {
        console.error('Error updating student profile:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ 
                success: false, 
                message: `Validation error: ${messages}` 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc Upload 10th marksheet PDF and percentage
 */
exports.uploadTenthMarksheet = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found.' });

        const percentage = Number(req.body.percentage);
        if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
            return res.status(400).json({ msg: 'Invalid percentage' });
        }

        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        if (!pdfUrl) return res.status(400).json({ msg: 'PDF file is required' });

        student.marksheets = student.marksheets || {};
        student.marksheets.tenth = { percentage, pdfUrl };
        await student.save();

        res.json({ msg: '10th marksheet uploaded', marksheets: student.marksheets });
    } catch (err) {
        console.error('Upload 10th marksheet error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @desc Upload Intermediate marksheet PDF and percentage
 */
exports.uploadInterMarksheet = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found.' });

        const percentage = Number(req.body.percentage);
        if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
            return res.status(400).json({ msg: 'Invalid percentage' });
        }

        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        if (!pdfUrl) return res.status(400).json({ msg: 'PDF file is required' });

        student.marksheets = student.marksheets || {};
        student.marksheets.inter = { percentage, pdfUrl };
        await student.save();

        res.json({ msg: 'Intermediate marksheet uploaded', marksheets: student.marksheets });
    } catch (err) {
        console.error('Upload inter marksheet error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @desc Upload semester-wise marksheet PDF and SGPA
 */
exports.uploadSemesterMarksheet = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found.' });

        const sem = Number(req.body.sem);
        const sgpa = Number(req.body.sgpa);
        const backlogs = req.body.backlogs !== undefined ? Number(req.body.backlogs) : undefined;
        if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
            return res.status(400).json({ msg: 'Invalid semester number' });
        }
        if (Number.isNaN(sgpa) || sgpa < 0 || sgpa > 10) {
            return res.status(400).json({ msg: 'Invalid SGPA' });
        }

        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        if (!pdfUrl) return res.status(400).json({ msg: 'PDF file is required' });

        student.marksheets = student.marksheets || {};
        student.marksheets.semesters = student.marksheets.semesters || [];
        // Replace if sem exists, else push
        const idx = student.marksheets.semesters.findIndex(s => s.sem === sem);
        const entry = { sem, sgpa, pdfUrl };
        if (!Number.isNaN(backlogs) && backlogs >= 0) entry.backlogs = backlogs;
        if (idx >= 0) student.marksheets.semesters[idx] = entry;
        else student.marksheets.semesters.push(entry);
        await student.save();

        res.json({ msg: 'Semester marksheet uploaded', marksheets: student.marksheets });
    } catch (err) {
        console.error('Upload semester marksheet error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @desc Upload CGPA certificate PDF and value
 */
exports.uploadCgpaCertificate = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found.' });
        const value = Number(req.body.value);
        if (Number.isNaN(value) || value < 0 || value > 10) {
            return res.status(400).json({ msg: 'Invalid CGPA' });
        }
        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        if (!pdfUrl) return res.status(400).json({ msg: 'PDF file is required' });
        student.marksheets = student.marksheets || {};
        student.marksheets.cgpa = { value, pdfUrl };
        await student.save();
        res.json({ msg: 'CGPA certificate uploaded', marksheets: student.marksheets });
    } catch (err) {
        console.error('Upload CGPA error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @desc Upload resume PDF and set resumeLink to stored file path
 */
exports.uploadResumePdf = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json({ msg: 'Student profile not found.' });
        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        if (!pdfUrl) return res.status(400).json({ msg: 'PDF file is required' });
        student.resumeLink = pdfUrl;
        await student.save();
        res.json({ msg: 'Resume uploaded successfully', resumeLink: student.resumeLink });
    } catch (err) {
        console.error('Upload resume error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};