const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');
const { getAllLiveJobs, applyForJob } = require('../controllers/studentController');

// Apply middleware for all student routes
router.use(auth, authorize(['student']));

// Defines the route: GET http://localhost:5000/api/student/jobs
router.get('/jobs', getAllLiveJobs);

// Defines the route: POST http://localhost:5000/api/student/jobs/:jobId/apply
router.post('/jobs/:jobId/apply', applyForJob);

module.exports = router;