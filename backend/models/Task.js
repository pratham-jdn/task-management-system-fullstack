const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a task description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to a user']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task duration
TaskSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.ceil((this.completedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for days until due
TaskSchema.virtual('daysUntilDue').get(function() {
  if (this.status === 'completed') return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for better query performance
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ status: 1 });

// Middleware to update completedAt when status changes to completed
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Static method to get task statistics
TaskSchema.statics.getTaskStats = async function(userId, isAdmin = false) {
  const matchStage = isAdmin ? {} : { assignedTo: userId };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const overdueTasks = await this.countDocuments({
    ...matchStage,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  });

  const result = {
    total: 0,
    pending: 0,
    'in-progress': 0,
    completed: 0,
    cancelled: 0,
    overdue: overdueTasks
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method to get priority distribution
TaskSchema.statics.getPriorityStats = async function(userId, isAdmin = false) {
  const matchStage = isAdmin ? {} : { assignedTo: userId };
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Task', TaskSchema);