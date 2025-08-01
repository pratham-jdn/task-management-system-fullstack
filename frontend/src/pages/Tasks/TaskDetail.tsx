import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTask } from '../../store/slices/taskSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getStatusColor, getPriorityColor, formatDate, formatRelativeTime, isOverdue } from '../../utils/helpers';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTask: task, loading } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchTask(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
          <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or has been deleted.</p>
          <Link to="/tasks" className="btn-primary">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || task.assignedTo.id === user?.id || task.createdBy.id === user?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tasks')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
        </div>
        
        {canEdit && (
          <div className="flex space-x-3">
            <Link
              to={`/tasks/${task.id}/edit`}
              className="btn-outline"
            >
              Edit Task
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center space-x-2">
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`badge ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div
                      key={attachment._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB • {formatDate(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:5001/uploads/${attachment.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{comment.user.name}</h4>
                        <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1">
                  <span className={`badge ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(task.dueDate)}
                    </span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(task.dueDate)}
                  </p>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {task.assignedTo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{task.assignedTo.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{task.assignedTo.email}</p>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {task.createdBy.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{task.createdBy.name}</span>
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(task.createdAt)}
                  <p className="text-xs text-gray-500">{formatRelativeTime(task.createdAt)}</p>
                </dd>
              </div>

              {task.completedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(task.completedAt)}
                    <p className="text-xs text-gray-500">{formatRelativeTime(task.completedAt)}</p>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {canEdit && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="w-full btn-outline text-center"
                >
                  Edit Task
                </Link>
              )}
              <Link
                to="/tasks"
                className="w-full btn-outline text-center"
              >
                Back to Tasks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;