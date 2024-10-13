const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/userModel');



const protect = async (req, res, next) => {
    let token;
  
    // Check if the token is present in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Get the token from the header
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
  
        // Ensure 'decoded.id' exists before using it to find the user
        if (!decoded.id) {
          return res.status(401).json({ success: false, message: "please provide userID" });
        }
  
        // Find the user by ID and exclude the password from the response
        req.user = await User.findById(decoded.id).select('-password');
  
        // Check if the user exists
        if (!req.user) {
          return res.status(401).json({ success: false, message: "User not found" });
        }
  
        next(); // Proceed to the next middleware/route handler
      } catch (error) {
        console.error(error); // Log error for debugging
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
  };


  
const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
  }
};

module.exports = { protect, checkRole };
