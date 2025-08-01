const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create user-specific directory
    const userDir = path.join(uploadDir, req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD) || 5 * 1024 * 1024, // 5MB default
    files: 3 // Maximum 3 files per task
  },
  fileFilter: fileFilter
});

// Middleware for handling file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 3 files allowed per task'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name for file upload'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only PDF files are allowed'
    });
  }

  next(error);
};

// Export upload middleware
exports.uploadTaskFiles = (req, res, next) => {
  const uploadMiddleware = upload.array('attachments', 3);
  
  uploadMiddleware(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    next();
  });
};

// Middleware to process uploaded files
exports.processUploadedFiles = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    req.uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));
  }
  
  // Parse JSON strings in form data
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      // If parsing fails, treat as empty array
      req.body.tags = [];
    }
  }
  
  next();
};

// Utility function to delete files
exports.deleteFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// Middleware to clean up files on error
exports.cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If there's an error and files were uploaded, clean them up
    if (res.statusCode >= 400 && req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      exports.deleteFiles(filePaths);
    }
    originalSend.call(this, data);
  };
  
  next();
};