const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
    let token;

    console.log('Auth Middleware - Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');
    console.log('Auth Middleware - Cookies:', req.cookies.token ? 'Cookie token present' : 'No cookie token');

    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Auth Middleware - Token extracted from Bearer header');
    }
    // Fallback to cookie token
    else if (req.cookies.token) {
        token = req.cookies.token;
        console.log('Auth Middleware - Token extracted from cookie');
    }

    if (!token) {
        console.log('Auth Middleware - No token found');
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        console.log('Auth Middleware - Attempting to verify token');
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log('Auth Middleware - Token decoded successfully, email:', decoded.email);
        
        const user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {
            console.log('Auth Middleware - User not found for email:', decoded.email);
            return res.status(401).json({ message: "Invalid token. User not found." });
        }

        console.log('Auth Middleware - User authenticated successfully:', user.email);
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Middleware - Token verification error:", err.message);
        return res.status(401).json({ message: "Invalid token." });
    }
};