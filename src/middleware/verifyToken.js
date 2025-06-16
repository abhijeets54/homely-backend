const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
        console.log('No Authorization header found');
        return res.status(401).json({ message: 'Access Denied: No Authorization header' });
    }
    
    const token = authHeader.split(' ')[1]; // Get token from Authorization header
    
    if (!token) {
        console.log('No token found in Authorization header');
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }
    
    console.log('Verifying token:', token.substring(0, 10) + '...');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully for user:', decoded.id, 'role:', decoded.role);
        req.user = decoded; // Set user information in request
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;