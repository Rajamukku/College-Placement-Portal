// File: server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Google OAuth client for verifying ID tokens from Google Identity Services
const googleClient = process.env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    : null;

/**
 * @route   POST api/auth/register/student
 * @desc    Register a new student
 * @access  Public
 */
exports.registerStudent = async (req, res) => {
    const { name, email, password, studentId, branch } = req.body;
    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        let studentById = await Student.findOne({ studentId });
        if (studentById) {
            return res.status(400).json({ msg: 'A student with this ID is already registered' });
        }

        const newUser = new User({ email, password, role: 'student' });
        
        // The pre-save hook on the User model will hash the password
        await newUser.save();

        const newStudent = new Student({ user: newUser.id, name, studentId, branch });
        await newStudent.save();

        const payload = { user: { id: newUser.id, role: 'student' } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error("Student Registration Error:", err.message);
        res.status(500).send('Server error');
    }
};

/**
 * @route   POST api/auth/register/company
 * @desc    Register a new company
 * @access  Public
 */
exports.registerCompany = async (req, res) => {
    const { name, email, password, website } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'A company with this email already exists' });
        }
        const newUser = new User({ email, password, role: 'company' });

        // The pre-save hook will hash the password
        await newUser.save();

        const newCompany = new Company({ user: newUser.id, name, website });
        await newCompany.save();

        const payload = { user: { id: newUser.id, role: 'company' } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error("Company Registration Error:", err.message);
        res.status(500).send('Server error');
    }
};


/**
 * @route   POST api/auth/login
 * @desc    Authenticate user (student, company, or admin) & get token
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    const { loginIdentifier, password, role: requestedRole } = req.body;
    try {
        if (!loginIdentifier || !password) {
            return res.status(400).json({ msg: 'Please provide an identifier and password.' });
        }

        let user;
        const isEmail = loginIdentifier.includes('@');

        if (isEmail) {
            user = await User.findOne({ email: loginIdentifier.toLowerCase().trim() });
        } else {
            // If not an email, assume it's a studentId
            const studentProfile = await Student.findOne({ studentId: loginIdentifier });
            if (studentProfile) {
                user = await User.findById(studentProfile.user);
            }
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate that the user's role matches the requested role (if provided)
        // This prevents students from logging in through company portal and vice versa
        if (requestedRole && requestedRole !== 'admin') {
            if (user.role !== requestedRole) {
                // Provide more helpful error messages based on the actual situation
                if (user.role === 'company' && requestedRole === 'student') {
                    return res.status(403).json({ 
                        msg: 'This account is registered as a Company account. Please select "Company" as your login type.' 
                    });
                } else if (user.role === 'student' && requestedRole === 'company') {
                    return res.status(403).json({ 
                        msg: 'This account is registered as a Student account. Please select "Student" as your login type.' 
                    });
                } else {
                    return res.status(403).json({ 
                        msg: `Access denied. This account is registered as a ${user.role} account, but you selected ${requestedRole}. Please select the correct account type.` 
                    });
                }
            }
        }

        // Also validate for non-email logins (studentId) - they should only be students
        if (!isEmail && user.role !== 'student') {
            return res.status(403).json({ 
                msg: 'Invalid login method for this account type. Please use email to login.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).send('Server error');
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset token
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const mailOptions = {
            to: user.email,
            from: `Placement Portal <${process.env.EMAIL_USER}>`,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click this <a href="${resetUrl}" target="_blank">link</a> to reset your password. It will expire in one hour.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user's password using token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save(); // pre-save hook will hash the password

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @route   POST /api/auth/admin/forgot-password
 * @desc    Send OTP to admin email for password reset
 * @access  Public
 */
exports.sendAdminOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email, role: 'admin' });
        // Always respond success style to avoid enumerating users
        if (!user) {
            return res.status(200).json({ msg: 'If the admin email exists, an OTP has been sent.' });
        }

        // Generate 6-digit numeric OTP
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
        user.resetOtpCode = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        await transporter.sendMail({
            to: user.email,
            from: `Placement Portal <${process.env.EMAIL_USER}>`,
            subject: 'Admin Password Reset OTP',
            html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 10 minutes.</p>`
        });

        return res.json({ msg: 'OTP sent to your email.' });
    } catch (err) {
        console.error('Send admin OTP error:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @route   POST /api/auth/admin/reset-password
 * @desc    Reset admin password using OTP
 * @access  Public
 */
exports.resetAdminPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ msg: 'Email, OTP and new password are required.' });
    }
    try {
        const user = await User.findOne({ email, role: 'admin' });
        if (!user || !user.resetOtpCode || !user.resetOtpExpire) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }
        if (user.resetOtpCode !== otp || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        user.password = newPassword;
        user.resetOtpCode = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        return res.json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
        console.error('Reset admin password with OTP error:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
};

/**
 * @route   POST /api/auth/google
 * @desc    Login/Register via Google ID token and return JWT
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body; // role optional, default to student
        if (!googleClient) {
            return res.status(500).json({ msg: 'Google client not configured' });
        }
        if (!credential) {
            return res.status(400).json({ msg: 'Missing Google credential' });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email?.toLowerCase();
        const name = payload.name || email;

        if (!email) {
            return res.status(400).json({ msg: 'Google response missing email' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            // Create user with random password; login via Google only
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = new User({ email, password: randomPassword, role: role || 'student' });
            await user.save();

            if (user.role === 'student') {
                // Create student profile skeleton
                const studentId = `G-${Date.now()}`;
                const newStudent = new Student({ user: user.id, name, studentId, branch: '' });
                await newStudent.save();
            }
        }

        // Issue JWT
        const tokenPayload = { user: { id: user.id, role: user.role } };
        jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};