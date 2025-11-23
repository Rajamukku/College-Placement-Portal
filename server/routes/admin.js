// File: server/routes/admin.js

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');

const {
    getDashboardStats,
    getAllJobs,
    getAllStudents,
    addStudent,
    updateStudentByAdmin,
    deleteStudent,
    changeStudentPassword,
    addCompany,
    getAllCompanies,
    getCompanyById, // NEW: Import the new function
    updateCompany,
    deleteCompany,
    changeCompanyPassword,
    changePassword,
    getReportsCsv
} = require('../controllers/adminController');

// This middleware protects all routes
router.use(auth, authorize(['admin']));

// --- Dashboard Stats ---
router.get('/stats', getDashboardStats);

// --- Admin Security ---
router.put('/change-password', changePassword);

// --- Reports ---
router.get('/reports/csv', getReportsCsv);

// --- Jobs Management ---
router.get('/jobs', getAllJobs);

// --- Students Management ---
router.get('/students', getAllStudents);
router.post('/add-student', addStudent);
router.put('/student/:id', updateStudentByAdmin);
router.delete('/student/:id', deleteStudent);
router.put('/student/:id/change-password', changeStudentPassword);

// --- Company Management ---
router.get('/companies', getAllCompanies);
router.post('/add-company', addCompany);

// NEW: Route to get a single company's full details for editing
router.get('/company/:id', getCompanyById);

// Routes using the company's MongoDB _id for operations
router.put('/company/:id', updateCompany);
router.delete('/company/:id', deleteCompany);
router.put('/company/:id/change-password', changeCompanyPassword);

// --- Admin Account Self-Management ---
router.put('/change-password', changePassword);

module.exports = router;