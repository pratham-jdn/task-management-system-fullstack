const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  removeAttachment,
  downloadAttachment,
  getTaskStats
} = require('../controllers/tasks');
const { protect, checkTaskAccess } = require('../middleware/auth');
const { uploadTaskFiles, processUploadedFiles, cleanupOnError } = require('../middleware/upload');
const {
  validateTaskCreation,
  validateTaskUpdate,
  validateTaskComment,
  validatePagination,
  validateTaskFilters,
  validateObjectId,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - dueDate
 *         - assignedTo
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the task
 *         title:
 *           type: string
 *           maxLength: 100
 *           description: The task title
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: The task description
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *           default: pending
 *           description: The task status
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *           description: The task priority
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The task due date
 *         assignedTo:
 *           $ref: '#/components/schemas/User'
 *         createdBy:
 *           $ref: '#/components/schemas/User'
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               originalName:
 *                 type: string
 *               mimetype:
 *                 type: string
 *               size:
 *                 type: number
 *               path:
 *                 type: string
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/components/schemas/User'
 *               text:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         estimatedHours:
 *           type: number
 *           minimum: 0
 *         actualHours:
 *           type: number
 *           minimum: 0
 *         completedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TaskStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *         pending:
 *           type: number
 *         in-progress:
 *           type: number
 *         completed:
 *           type: number
 *         cancelled:
 *           type: number
 *         overdue:
 *           type: number
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (filtered by user access)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of tasks per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *       - in: query
 *         name: dueBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due before this date
 *       - in: query
 *         name: dueAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks due after this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and tags
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *         description: Filter overdue tasks
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field and order (e.g., dueDate:asc, priority:desc)
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *                 description: User ID
 *               estimatedHours:
 *                 type: number
 *                 minimum: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *                 description: PDF files (max 3)
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or assigned user not found
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(validatePagination, validateTaskFilters, handleValidationErrors, getTasks)
  .post(
    uploadTaskFiles,
    processUploadedFiles,
    cleanupOnError,
    validateTaskCreation,
    handleValidationErrors,
    createTask
  );

/**
 * @swagger
 * /api/tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskStats:
 *                       $ref: '#/components/schemas/TaskStats'
 *                     priorityStats:
 *                       type: array
 *                     monthlyStats:
 *                       type: array
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/stats', getTaskStats);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to access this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *                 description: User ID
 *               estimatedHours:
 *                 type: number
 *                 minimum: 0
 *               actualHours:
 *                 type: number
 *                 minimum: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 3
 *                 description: Additional PDF files (max 3 total)
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error or too many attachments
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to delete this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(validateObjectId, handleValidationErrors, getTask)
  .put(
    validateObjectId,
    uploadTaskFiles,
    processUploadedFiles,
    cleanupOnError,
    validateTaskUpdate,
    handleValidationErrors,
    updateTask
  )
  .delete(validateObjectId, handleValidationErrors, deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     summary: Add comment to task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to comment on this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comments', validateObjectId, validateTaskComment, handleValidationErrors, addComment);

/**
 * @swagger
 * /api/tasks/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Remove attachment from task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment removed successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to modify this task
 *       404:
 *         description: Task or attachment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/attachments/:attachmentId', validateObjectId, handleValidationErrors, removeAttachment);

/**
 * @swagger
 * /api/tasks/{id}/attachments/{attachmentId}/download:
 *   get:
 *     summary: Download task attachment
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to access this task
 *       404:
 *         description: Task, attachment, or file not found
 *       500:
 *         description: Server error
 */
router.get('/:id/attachments/:attachmentId/download', validateObjectId, handleValidationErrors, downloadAttachment);

module.exports = router;