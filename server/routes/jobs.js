const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');
const { 
    createJob, 
    getCompanyJobs,
    getAllApplicantsForCompany,
    getApplicantsForJob,
    updateJob,
    getCompanySummary,
    getJobsByCompanyPublic
} = require('../controllers/jobController');

// Defines the route: POST http://localhost:5000/api/jobs
// Creates a new job posting. Only accessible by logged-in companies.
router.post('/', [auth, authorize(['company'])], createJob);


// =======================================================================
// THIS IS THE NEW ROUTE THAT WAS MISSING
// =======================================================================
// Defines the route: GET http://localhost:5000/api/jobs/my-postings
// This matches the exact URL the frontend is trying to call.
router.get('/my-postings', [auth, authorize(['company'])], getCompanyJobs);
// =======================================================================

// Defines the route: GET http://localhost:5000/api/jobs/applicants
// Gets all applicants for all jobs posted by the company
router.get('/applicants', [auth, authorize(['company'])], getAllApplicantsForCompany);

// Defines the route: GET http://localhost:5000/api/jobs/:jobId/applicants
// Gets applicants for a specific job.
router.get('/:jobId/applicants', [auth, authorize(['company'])], getApplicantsForJob);


// Defines the route: PUT http://localhost:5000/api/jobs/:jobId
// Updates a specific job posting (including changing its status).
router.put('/:jobId', [auth, authorize(['company'])], updateJob);
// Company summary (pipeline and totals)
router.get('/summary', [auth, authorize(['company'])], getCompanySummary);

// Public route: list jobs for a specific company (for students viewing company profile)
router.get('/company/:companyId', getJobsByCompanyPublic);


module.exports = router;