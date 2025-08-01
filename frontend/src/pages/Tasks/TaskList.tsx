import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks } from '../../store/slices/taskSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getStatusColor, getPriorityColor, formatDate, isOverdue } from '../../utils/helpers';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, pagination } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Link
          to="/tasks/create"
          className="btn-primary"
        >
          Create Task
        </Link>
      </div>

      {/* Tasks List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <Link
              to="/tasks/create"
              className="btn-primary mt-4"
            >
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Title</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Due Date</th>
                  <th className="table-header-cell">Assigned To</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="table-cell">
                      <div>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {task.title}
                        </Link>
                        {isOverdue(task.dueDate, task.status) && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}>
                        {formatDate(task.dueDate)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {task.assignedTo.name}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View
                        </Link>
                        <Link
                          to={`/tasks/${task.id}/edit`}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {tasks.length} of {pagination.totalTasks} tasks
          </div>
          <div className="flex space-x-2">
            {pagination.hasPrev && (
              <button className="btn-outline">
                Previous
              </button>
            )}
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            {pagination.hasNext && (
              <button className="btn-outline">
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;