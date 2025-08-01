const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Sort
    let sortBy = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      sortBy[field] = order === 'desc' ? -1 : 1;
    } else {
      sortBy.createdAt = -1; // Default sort by newest first
    }

    // Execute query
    const users = await User.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex)
      .select('-password');

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Own Profile
exports.getUser = async (req, res) => {
  try {
    // Check if user is accessing their own profile or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this user'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's task statistics
    const taskStats = await Task.getTaskStats(user._id, false);

    res.status(200).json({
      success: true,
      data: {
        user,
        taskStats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
exports.updateUser = async (req, res) => {
  try {
    // Check if user is updating their own profile or is admin
    const isOwnProfile = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    const { name, email, role, isActive } = req.body;
    const fieldsToUpdate = {};

    // Users can update their own name and email
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    // Only admins can update role and isActive status
    if (isAdmin) {
      if (role) fieldsToUpdate.role = role;
      if (isActive !== undefined) fieldsToUpdate.isActive = isActive;
    } else {
      // Non-admin users cannot change role or isActive
      if (role || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update role or active status'
        });
      }
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has assigned tasks
    const assignedTasks = await Task.countDocuments({ assignedTo: req.params.id });
    const createdTasks = await Task.countDocuments({ createdBy: req.params.id });

    if (assignedTasks > 0 || createdTasks > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete user. User has ${assignedTasks} assigned tasks and ${createdTasks} created tasks. Please reassign or delete these tasks first.`
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Users who logged in within the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeInLastWeek = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        activeInLastWeek
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Activate user
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get users available for task assignment
// @route   GET /api/users/assignable
// @access  Private
exports.getAssignableUsers = async (req, res) => {
  try {
    // Get all active users with basic info for task assignment
    const users = await User.find({ isActive: true })
      .select('name email role')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get assignable users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};