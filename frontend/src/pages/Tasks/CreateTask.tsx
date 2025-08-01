import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createTask } from '../../store/slices/taskSlice';
import { fetchAssignableUsers } from '../../store/slices/userSlice';
import { CreateTaskData } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.tasks);
  const { users } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTaskData>();

  const watchedDueDate = watch('dueDate');

  useEffect(() => {
    // Fetch users for assignment dropdown
    dispatch(fetchAssignableUsers());
  }, [dispatch]);

  const onSubmit = async (data: CreateTaskData) => {
    try {
      // Prepare task data
      const taskData: CreateTaskData = {
        ...data,
        tags: data.tags && typeof data.tags === 'string' 
          ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) 
          : Array.isArray(data.tags) ? data.tags : [],
        attachments: selectedFile ? [selectedFile] : [],
      };

      await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, images, and text files are allowed');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <button
          onClick={() => navigate('/tasks')}
          className="btn-outline"
        >
          Back to Tasks
        </button>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="form-label">
              Task Title *
            </label>
            <input
              {...register('title', {
                required: 'Task title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters',
                },
              })}
              type="text"
              className="form-input"
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'Description must be less than 1000 characters',
                },
              })}
              rows={4}
              className="form-input"
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="form-error">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="form-label">
                Priority *
              </label>
              <select
                {...register('priority', {
                  required: 'Priority is required',
                })}
                className="form-input"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {errors.priority && (
                <p className="form-error">{errors.priority.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                {...register('status')}
                className="form-input"
                defaultValue="pending"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="form-label">
                Due Date *
              </label>
              <input
                {...register('dueDate', {
                  required: 'Due date is required',
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                      return 'Due date cannot be in the past';
                    }
                    return true;
                  },
                })}
                type="date"
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && (
                <p className="form-error">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="form-label">
                Assign To *
              </label>
              <select
                {...register('assignedTo', {
                  required: 'Please assign the task to someone',
                })}
                className="form-input"
                defaultValue={currentUser?.id}
              >
                <option value="">
                  {users.length === 0 ? 'Loading users...' : 'Select assignee'}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.assignedTo && (
                <p className="form-error">{errors.assignedTo.message}</p>
              )}
              {users.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Loading available users...
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              className="form-input"
              placeholder="Enter tags separated by commas (e.g., urgent, frontend, bug)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* File Attachment */}
          <div>
            <label htmlFor="attachment" className="form-label">
              Attachment
            </label>
            <div className="space-y-2">
              <input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="form-input"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, Images (JPG, PNG, GIF), Text files. Max size: 5MB
              </p>
              
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Due Date Warning */}
          {watchedDueDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  Due date: {new Date(watchedDueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;