const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Student = require('../models/Student');
const { calculateMatchScore } = require('../utils/matchScore');

/**
 * @route   POST api/jobs
 * @desc    Create a new job posting
 * @access  Private (Company)
 */
exports.createJob = async (req, res) => {
    try {
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Company profile not found. Please create one.' });
        }

        const newJob = new Job({
            ...req.body,
            company: company.id,
        });
        
        await newJob.save();
        res.status(201).json(newJob);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// =======================================================================
// THIS IS THE NEW FUNCTION THAT WAS MISSING
// =======================================================================
/**
 * @route   GET api/jobs/my-postings
 * @desc    Get all jobs posted by the logged-in company
 * @access  Private (Company)
 */
exports.getCompanyJobs = async (req, res) => {
    try {
        // Find the company profile associated with the logged-in user
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Company profile not found.' });
        }

        // Find all jobs where the 'company' field matches this company's ID
        // Sort by the most recently posted date
        const jobs = await Job.find({ company: company.id }).sort({ datePosted: -1 });
        
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

    } catch (err) {
        console.error('Get Company Jobs Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};
// =======================================================================


/**
 * @route   GET api/jobs/applicants
 * @desc    Get all applicants for all jobs posted by the company
 * @access  Private (Company)
 */
exports.getAllApplicantsForCompany = async (req, res) => {
    try {
        // First, verify the company exists
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Company profile not found.' });
        }

        // Get all jobs for this company
        const jobs = await Job.find({ company: company.id }).select('_id title skills');
        const jobIds = jobs.map(j => j._id);

        if (jobIds.length === 0) {
            return res.json([]);
        }

        // Get all applications for company's jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate({
                path: 'student',
                model: 'Student',
                select: 'name studentId branch phone resumeLink academics skills projects internships achievements marksheets',
                populate: { path: 'user', select: 'email' }
            })
            .populate({
                path: 'job',
                model: 'Job',
                select: 'title skills'
            });

        // Map applications to include job info and match score
        const applicantsWithScore = applications
            .filter(app => app.student && app.job) // Filter out null students/jobs
            .map(app => {
                const student = app.student;
                const job = app.job;
                const studentSkills = student.skills || '';
                const jobSkills = job.skills || '';
                const matchScore = calculateMatchScore(studentSkills, jobSkills);
                
                return {
                    _id: student._id,
                    name: student.name || 'Unknown',
                    studentId: student.studentId || '',
                    branch: student.branch || '',
                    phone: student.phone || '',
                    email: student.user?.email || '',
                    academics: student.academics || {},
                    skills: studentSkills,
                    resumeLink: student.resumeLink || '',
                    projects: student.projects || [],
                    internships: student.internships || [],
                    achievements: student.achievements || [],
                    marksheets: student.marksheets || {},
                    applicationId: app._id,
                    status: app.status || 'applied',
                    matchScore: matchScore || 0,
                    jobId: job._id,
                    jobTitle: job.title || ''
                };
            });
        
        res.json(applicantsWithScore);

    } catch (err) {
        console.error('Get All Applicants Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

/**
 * @route   GET api/jobs/:jobId/applicants
 * @desc    Get all applicants for a specific job, with AI match score
 * @access  Private (Company)
 */
exports.getApplicantsForJob = async (req, res) => {
    try {
        // First, verify the company exists and owns this job
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Company profile not found.' });
        }

        const job = await Job.findById(req.params.jobId).populate('company', 'name');
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Verify the company owns this job
        if (job.company._id.toString() !== company._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized to view applicants for this job.' });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate({
                path: 'student',
                model: 'Student',
                select: 'name studentId branch phone resumeLink academics skills projects internships achievements marksheets',
                populate: { path: 'user', select: 'email' }
            });

        const applicantsWithScore = applications
            .filter(app => app.student) // Filter out applications with null students
            .map(app => {
                const student = app.student;
                const studentSkills = student.skills || '';
                const jobSkills = job.skills || '';
                const matchScore = calculateMatchScore(studentSkills, jobSkills);
                
                return {
                    _id: student._id,
                    name: student.name || 'Unknown',
                    studentId: student.studentId || '',
                    branch: student.branch || '',
                    phone: student.phone || '',
                    email: student.user?.email || '',
                    academics: student.academics || {},
                    skills: studentSkills,
                    resumeLink: student.resumeLink || '',
                    projects: student.projects || [],
                    internships: student.internships || [],
                    achievements: student.achievements || [],
                    marksheets: student.marksheets || {},
                    applicationId: app._id,
                    status: app.status || 'applied',
                    matchScore: matchScore || 0,
                };
            });
        
        res.json(applicantsWithScore);

    } catch (err) {
        console.error('Get Applicants Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// =======================================================================
// THIS FUNCTION IS NOW UPDATED TO HANDLE CLOSING A JOB
// =======================================================================
/**
 * @route   PUT api/jobs/:jobId
 * @desc    Update a job posting (e.g., details, or status to 'Closed')
 * @access  Private (Company)
 */
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Ensure the logged-in company owns this job posting
        const company = await Company.findOne({ user: req.user.id });
        if (job.company.toString() !== company.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Use findByIdAndUpdate to apply the changes from the request body
        // The { new: true } option returns the document after the update is applied.
        job = await Job.findByIdAndUpdate(
            req.params.jobId, 
            { $set: req.body }, 
            { new: true }
        );
        
        res.json(job);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// =======================================================================

// =======================================================================
// COMPANY SUMMARY: pipeline and totals for the logged-in company
// =======================================================================
/**
 * @route   GET api/jobs/summary
 * @desc    Get pipeline counts and totals for the logged-in company
 * @access  Private (Company)
 */
exports.getCompanySummary = async (req, res) => {
    try {
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Company profile not found.' });
        }

        const jobs = await Job.find({ company: company.id }).select('_id status');
        const jobIds = jobs.map(j => j._id);
        const activeJobs = jobs.filter(j => j.status === 'Live').length;

        if (jobIds.length === 0) {
            return res.json({
                activeJobs: 0,
                totalApplications: 0,
                pipeline: { applied: 0, shortlisted: 0, interview: 0, rejected: 0, hired: 0, hold: 0 },
                hires: 0
            });
        }

        const pipelineAgg = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const pipeline = { applied: 0, shortlisted: 0, interview: 0, rejected: 0, hired: 0, hold: 0 };
        let totalApplications = 0;
        pipelineAgg.forEach(({ _id, count }) => {
            if (pipeline[_id] !== undefined) pipeline[_id] = count;
            totalApplications += count;
        });

        res.json({
            activeJobs,
            totalApplications,
            pipeline,
            hires: pipeline.hired
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Public: list jobs by company for students to view company profile details
exports.getJobsByCompanyPublic = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const jobs = await Job.find({ company: companyId, status: 'Live' })
            .select('title description skills eligibility deadline datePosted')
            .sort({ datePosted: -1 });
        res.json({ success: true, jobs });
    } catch (err) {
        console.error('Get jobs by company error:', err);
        res.status(500).json({ success: false, message: 'Failed to load jobs' });
    }
};