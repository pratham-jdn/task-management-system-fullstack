import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTaskStats } from '../../store/slices/taskSlice';
import { fetchTasks } from '../../store/slices/taskSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getStatusColor, getPriorityColor, formatRelativeTime, isOverdue } from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, tasks, loading } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 5, sort: 'dueDate:asc' }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const overdueTasks = tasks.filter(task => isOverdue(task.dueDate, task.status));
  const upcomingTasks = tasks.filter(task => !isOverdue(task.dueDate, task.status) && task.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">🔄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats['in-progress']}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
          </div>
          <div className="p-6">
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No overdue tasks! 🎉</p>
            ) : (
              <div className="space-y-3">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Due {formatRelativeTime(task.dueDate)}
                      </p>
                    </div>
                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <Link
                    to="/tasks?overdue=true"
                    className="block text-center text-sm text-blue-600 hover:text-blue-500 mt-3"
                  >
                    View all {overdueTasks.length} overdue tasks
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="p-6">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Due {formatRelativeTime(task.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length > 3 && (
                  <Link
                    to="/tasks"
                    className="block text-center text-sm text-blue-600 hover:text-blue-500 mt-3"
                  >
                    View all tasks
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/tasks/create"
            className="btn-primary"
          >
            Create New Task
          </Link>
          <Link
            to="/tasks"
            className="btn-outline"
          >
            View All Tasks
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/users"
              className="btn-outline"
            >
              Manage Users
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;