const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');
const { getCompanyProfile, updateCompanyProfile } = require('../controllers/companyController');
const Company = require('../models/Company');

// Public endpoints for students to browse companies
router.get('/', async (req, res) => {
    try {
        const search = (req.query.search || '').trim();
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};
        const companies = await Company.find(query).select('_id companyId name website industry logoUrl');
        res.json({ success: true, companies });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to load companies' });
    }
});

// IMPORTANT: /me route must come BEFORE /:id route to prevent /me from being matched as /:id
// Defines the route: GET http://localhost:5000/api/companies/me
// For a company to fetch its own profile details.
router.get('/me', auth, authorize(['company']), getCompanyProfile);

// Public route for students to view a specific company profile
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).select('-__v');
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
        res.json({ success: true, company });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Failed to load company' });
    }
});

// Company-protected endpoints
router.use(auth, authorize(['company']));

// Defines the route: PUT http://localhost:5000/api/companies/profile
// For a company to update its own profile details.
router.put('/profile', updateCompanyProfile);

module.exports = router;