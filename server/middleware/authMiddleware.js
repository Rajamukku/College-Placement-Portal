// File: server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Get token from header (try multiple methods for compatibility)
    const token = req.header('x-auth-token') || 
                  req.headers['x-auth-token'] || 
                  req.headers['X-Auth-Token'] ||
                  req.headers['authorization']?.replace('Bearer ', '');

    // 2. Check if not token
    if (!token) {
        console.log('Auth Error: No token found. Authorization denied.');
        console.log('Request headers:', req.headers);
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        // console.log(`Auth Success: User ${req.user.id} with role ${req.user.role} authenticated.`);
        next();
    } catch (e) {
        console.error('Auth Error: Token is not valid.', e.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
         console.log(`Authorize Error: User object not found on request.`);
         return res.status(403).json({ msg: 'Forbidden: Authentication error.' });
    }

    if (!roles.includes(req.user.role)) {
        console.log(`Authorize Error: User role '${req.user.role}' is not authorized for this route. Required: ${roles.join(', ')}`);
        return res.status(403).json({ msg: 'Forbidden: You do not have the required role' });
    }
    
    // console.log(`Authorize Success: Role '${req.user.role}' is authorized.`);
    next();
};

module.exports = { auth, authorize };