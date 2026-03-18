const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, email }
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
};

const isWarden = (req, res, next) => {
    if (req.user && (req.user.role === 'Warden' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Warden or Admin role required.' });
    }
};

const isMessOwner = (req, res, next) => {
    if (req.user && (req.user.role === 'Mess Owner' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Mess Owner or Admin role required.' });
    }
};

module.exports = { authMiddleware, isAdmin, isWarden, isMessOwner };
