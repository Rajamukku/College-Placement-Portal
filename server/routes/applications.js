// server/routes/applications.js

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Student = require('../models/Student');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * @route   GET /api/applications
 * @desc    Student list own applications
 * @access  Private (Student)
 */
router.get('/', [auth, authorize(['student'])], async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) return res.status(404).json([]);
        const apps = await Application.find({ student: student._id })
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name logoUrl'
                }
            });
        const mapped = apps.map(a => ({
            _id: a._id,
            status: a.status,
            createdAt: a.createdAt,
            job: a.job ? {
                _id: a.job._id,
                title: a.job.title,
                company: a.job.company ? {
                    _id: a.job.company._id,
                    name: a.job.company.name,
                    logoUrl: a.job.company.logoUrl
                } : null
            } : null,
        }));
        res.json(mapped);
    } catch (e) {
        console.error('Get Applications Error:', e);
        res.status(500).json([]);
    }
});

/**
 * @route   PUT /api/applications/:applicationId/status
 * @desc    Company updates an applicant's status
 * @access  Private (Company)
 */
router.put('/:applicationId/status', [auth, authorize(['company'])], async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['shortlisted', 'interview', 'rejected', 'hired', 'hold', 'applied'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status provided.' });
        }

        const application = await Application.findById(req.params.applicationId).populate('job');
        if (!application) {
            return res.status(404).json({ msg: 'Application not found.' });
        }

        // Security check: Ensure the company updating the status owns the job
        const company = await Company.findOne({ user: req.user.id });
        if (application.job.company.toString() !== company._id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to update this application.' });
        }
        
        application.status = status;
        await application.save();

        // Send email notification based on status
        try {
            const student = await Student.findById(application.student);
            if (student) {
                const user = await User.findById(student.user);
                if (user && user.email) {
                    let subject = '';
                    let message = '';

                    if (status === 'shortlisted') {
                        subject = `Congratulations! You've been shortlisted for ${application.job.title}`;
                        message = `
                            <p>Dear ${student.name},</p>
                            <p>Congratulations! We are pleased to inform you that you have been shortlisted for the position of <strong>${application.job.title}</strong> at ${company.name}.</p>
                            <p>We were impressed with your qualifications and would like to move forward with the next steps in our hiring process.</p>
                            <p>Our team will contact you shortly to schedule the next round of interviews.</p>
                            <p>Best regards,<br/>${company.name} Recruitment Team</p>
                        `;
                    } else if (status === 'hired') {
                        subject = `Congratulations! Job Offer from ${company.name}`;
                        message = `
                            <p>Dear ${student.name},</p>
                            <p>Congratulations! We are delighted to offer you the position of <strong>${application.job.title}</strong> at ${company.name}.</p>
                            <p>We were very impressed with your qualifications and believe you would be a great addition to our team.</p>
                            <p>Our HR team will contact you shortly with details about the offer package and next steps.</p>
                            <p>We look forward to welcoming you to our team!</p>
                            <p>Best regards,<br/>${company.name} Recruitment Team</p>
                        `;
                    } else if (status === 'interview') {
                        subject = `Interview Invitation - ${application.job.title}`;
                        message = `
                            <p>Dear ${student.name},</p>
                            <p>Thank you for your interest in the <strong>${application.job.title}</strong> position at ${company.name}.</p>
                            <p>We would like to invite you for an interview. Our team will contact you shortly to schedule a convenient time.</p>
                            <p>Best regards,<br/>${company.name} Recruitment Team</p>
                        `;
                    }

                    if (subject && message && process.env.EMAIL_USER) {
                        await transporter.sendMail({
                            to: user.email,
                            from: `Placement Portal <${process.env.EMAIL_USER}>`,
                            subject: subject,
                            html: message,
                        });
                    }
                }
            }
        } catch (emailError) {
            console.error('Error sending email notification:', emailError);
            // Don't fail the request if email fails
        }

        res.json(application);

    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;