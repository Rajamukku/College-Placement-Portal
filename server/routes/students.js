const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, authorize } = require('../middleware/authMiddleware');
const { 
    getStudentProfile, 
    updateStudentProfile,
    uploadTenthMarksheet,
    uploadInterMarksheet,
    uploadSemesterMarksheet,
    uploadResumePdf,
    uploadCgpaCertificate
} = require('../controllers/studentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
        const userTag = (req.user && req.user.id) ? req.user.id : 'anon';
        cb(null, `${Date.now()}-${userTag}-${base}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Validation middleware (relaxed for partial updates)
// Note: name and studentId are immutable fields and should not be validated/changed
const validateStudentProfile = [
    // Students cannot change name or studentId, so we don't validate them here
    // Phone validation - allow Indian phone numbers and empty strings
    check('phone').optional({ checkFalsy: true }).custom((value) => {
        if (!value || value === '') return true; // Allow empty
        // Remove all spaces, dashes, and parentheses
        const cleaned = value.toString().replace(/[\s\-()]/g, '');
        // Check if it's a valid Indian mobile number:
        // - 10 digits starting with 6, 7, 8, or 9
        // - Or +91 followed by 10 digits starting with 6, 7, 8, or 9
        // - Or 0 followed by 10 digits starting with 6, 7, 8, or 9 (landline format, but we'll allow it)
        const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
        if (phoneRegex.test(cleaned)) return true;
        throw new Error('Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)');
    }),
    check('branch').optional().isString().trim(),
    // Resume link validation - allow URLs, relative paths, or empty
    check('resumeLink').optional({ checkFalsy: true }).custom((value) => {
        if (!value || value === '') return true; // Allow empty
        const trimmed = value.toString().trim();
        // Allow relative paths (starting with /)
        if (trimmed.startsWith('/')) return true;
        // Allow full URLs (http/https)
        try {
            const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
            new URL(url);
            return true;
        } catch {
            throw new Error('Resume link must be a valid URL or file path');
        }
    }),
    // Academics validation - convert strings to numbers
    check('academics.tenth', '10th percentage must be a number between 0 and 100')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error('10th percentage must be a valid number');
            if (num < 0 || num > 100) throw new Error('10th percentage must be between 0 and 100');
            return true;
        }),
    check('academics.twelfth', '12th percentage must be a number between 0 and 100')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error('12th percentage must be a valid number');
            if (num < 0 || num > 100) throw new Error('12th percentage must be between 0 and 100');
            return true;
        }),
    check('academics.cpi', 'CPI must be a number between 0 and 10')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === null || value === undefined) return true;
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error('CPI must be a valid number');
            if (num < 0 || num > 10) throw new Error('CPI must be between 0 and 10');
            return true;
        }),
    check('skills', 'Skills must be an array').optional().isArray(),
    check('dateOfBirth').optional({ checkFalsy: true }).isISO8601().withMessage('Date of birth must be a valid date in ISO format (YYYY-MM-DD)'),
    check('gender').optional({ checkFalsy: true }).isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    check('address').optional().isString().trim(),
    check('city').optional().isString().trim(),
    check('state').optional().isString().trim(),
    // Pincode validation - allow Indian pincodes (6 digits) or empty
    check('pincode').optional({ checkFalsy: true }).custom((value) => {
        if (!value || value === '') return true; // Allow empty
        const pincodeRegex = /^\d{6}$/;
        if (pincodeRegex.test(value.toString().trim())) return true;
        throw new Error('Pincode must be a 6-digit number');
    }),
    // URL validation - allow empty or valid URLs (with or without protocol)
    check('linkedin').optional({ checkFalsy: true }).custom((value) => {
        if (!value || value === '') return true;
        const trimmed = value.toString().trim();
        // Remove trailing slashes for validation
        const cleaned = trimmed.replace(/\/+$/, '');
        try {
            // Add protocol if missing
            const url = cleaned.startsWith('http://') || cleaned.startsWith('https://') 
                ? cleaned 
                : `https://${cleaned}`;
            const urlObj = new URL(url);
            // Basic validation - should have a hostname
            if (!urlObj.hostname || urlObj.hostname.length === 0) {
                throw new Error('Invalid URL format');
            }
            return true;
        } catch (err) {
            throw new Error('LinkedIn must be a valid URL (e.g., linkedin.com/in/yourprofile or https://linkedin.com/in/yourprofile)');
        }
    }),
    check('github').optional({ checkFalsy: true }).custom((value) => {
        if (!value || value === '') return true;
        const trimmed = value.toString().trim();
        // Remove trailing slashes for validation
        const cleaned = trimmed.replace(/\/+$/, '');
        try {
            // Add protocol if missing
            const url = cleaned.startsWith('http://') || cleaned.startsWith('https://') 
                ? cleaned 
                : `https://${cleaned}`;
            const urlObj = new URL(url);
            // Basic validation - should have a hostname
            if (!urlObj.hostname || urlObj.hostname.length === 0) {
                throw new Error('Invalid URL format');
            }
            return true;
        } catch (err) {
            throw new Error('GitHub must be a valid URL (e.g., github.com/yourusername or https://github.com/yourusername)');
        }
    })
];

// Apply auth middleware to all routes
router.use(auth, authorize(['student']));

/**
 * @route   GET /api/students/me
 * @desc    Get current student's profile
 * @access  Private (Student)
 */
router.get('/me', getStudentProfile);

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile
 * @access  Private (Student)
 */
router.put('/profile', validateStudentProfile, updateStudentProfile);

/**
 * @route   POST /api/students/marksheets/tenth
 * @desc    Upload 10th marksheet PDF and percentage
 */
router.post('/marksheets/tenth', upload.single('pdf'), uploadTenthMarksheet);

/**
 * @route   POST /api/students/marksheets/inter
 * @desc    Upload Intermediate marksheet PDF and percentage
 */
router.post('/marksheets/inter', upload.single('pdf'), uploadInterMarksheet);

/**
 * @route   POST /api/students/marksheets/semester
 * @desc    Upload semester-wise marksheet PDF and SGPA
 */
router.post('/marksheets/semester', upload.single('pdf'), uploadSemesterMarksheet);

/**
 * @route   POST /api/students/marksheets/cgpa
 * @desc    Upload CGPA certificate PDF and value
 */
router.post('/marksheets/cgpa', upload.single('pdf'), uploadCgpaCertificate);

/**
 * @route   POST /api/students/resume
 * @desc    Upload resume PDF and save to profile
 */
router.post('/resume', upload.single('pdf'), uploadResumePdf);

module.exports = router;