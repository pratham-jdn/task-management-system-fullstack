const Task = require('../models/Task');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { deleteFiles } = require('../middleware/upload');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // If not admin, only show tasks user created or is assigned to
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }

    // Date filters
    if (req.query.dueBefore) {
      query.dueDate = { ...query.dueDate, $lte: new Date(req.query.dueBefore) };
    }

    if (req.query.dueAfter) {
      query.dueDate = { ...query.dueDate, $gte: new Date(req.query.dueAfter) };
    }

    // Search functionality
    if (req.query.search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ]
      });
    }

    // Overdue filter
    if (req.query.overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['completed', 'cancelled'] };
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
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .sort(sortBy)
      .limit(limit)
      .skip(startIndex);

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        task.createdBy._id.toString() !== req.user._id.toString() && 
        task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, estimatedHours, tags } = req.body;

    // Verify assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: 'Assigned user not found'
      });
    }

    if (!assignedUser.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot assign task to inactive user'
      });
    }

    // Create task data
    const taskData = {
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      estimatedHours,
      tags: tags || []
    };

    // Handle file attachments
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      taskData.attachments = req.uploadedFiles;
    }

    const task = await Task.create(taskData);

    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    // Clean up uploaded files if task creation failed
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      const filePaths = req.uploadedFiles.map(file => file.path);
      deleteFiles(filePaths);
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    const { title, description, status, priority, dueDate, assignedTo, estimatedHours, actualHours, tags } = req.body;

    // Verify assigned user exists if being updated
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }

      if (!assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Cannot assign task to inactive user'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = dueDate;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (tags) updateData.tags = tags;

    // Handle new file attachments
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      // Check if total attachments would exceed limit
      const currentAttachments = task.attachments.length;
      const newAttachments = req.uploadedFiles.length;
      
      if (currentAttachments + newAttachments > 3) {
        // Clean up uploaded files
        const filePaths = req.uploadedFiles.map(file => file.path);
        deleteFiles(filePaths);
        
        return res.status(400).json({
          success: false,
          error: 'Maximum 3 attachments allowed per task'
        });
      }

      updateData.$push = { attachments: { $each: req.uploadedFiles } };
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name email')
     .populate('comments.user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    // Clean up uploaded files if task update failed
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      const filePaths = req.uploadedFiles.map(file => file.path);
      deleteFiles(filePaths);
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions - only creator or admin can delete
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    // Delete associated files
    if (task.attachments && task.attachments.length > 0) {
      const filePaths = task.attachments.map(attachment => attachment.path);
      deleteFiles(filePaths);
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to comment on this task'
      });
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    // Populate the new comment
    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email')
      .select('comments');

    const newComment = updatedTask.comments[updatedTask.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Remove attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
exports.removeAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this task'
      });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // Remove attachment from task
    task.attachments.pull(req.params.attachmentId);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Attachment removed successfully'
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Download attachment
// @route   GET /api/tasks/:id/attachments/:attachmentId/download
// @access  Private
exports.downloadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimetype);

    // Stream the file
    const fileStream = fs.createReadStream(attachment.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;

    // Get basic task statistics
    const taskStats = await Task.getTaskStats(userId, isAdmin);

    // Get priority distribution
    const priorityStats = await Task.getPriorityStats(userId, isAdmin);

    // Get tasks by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const matchStage = isAdmin ? {} : {
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    };

    const monthlyStats = await Task.aggregate([
      { 
        $match: {
          ...matchStage,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        taskStats,
        priorityStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};