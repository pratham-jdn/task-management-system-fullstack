const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No user found with this token'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user can access resource (own resource or admin)
exports.checkResourceAccess = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // For other users, check if they own the resource
    // This will be used in route handlers to compare with resource owner
    req.checkOwnership = true;
    req.resourceUserField = resourceUserField;
    next();
  };
};

// Middleware to check task ownership or assignment
exports.checkTaskAccess = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Admin can access all tasks
    if (req.user.role === 'admin') {
      req.task = task;
      return next();
    }

    // User can access tasks they created or are assigned to
    if (task.createdBy.toString() === req.user._id.toString() || 
        task.assignedTo.toString() === req.user._id.toString()) {
      req.task = task;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this task'
    });
  } catch (error) {
    console.error('Task access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Rate limiting for sensitive operations
exports.sensitiveOperationLimit = (req, res, next) => {
  // This can be enhanced with Redis for distributed rate limiting
  // For now, we'll use the global rate limiter
  next();
};