import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { TaskState, Task, TaskFilters, CreateTaskData, UpdateTaskData, PaginatedResponse, ApiResponse, TaskStats } from '../../types';

// Initial state
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    page: 1,
    limit: 10,
    sort: 'createdAt:desc',
  },
  stats: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData, { rejectWithValue }) => {
    try {
      console.log('Redux createTask - received data:', taskData);
      
      const formData = new FormData();
      
      // Append task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (key === 'attachments' && Array.isArray(value)) {
          value.forEach((file) => {
            formData.append('attachments', file);
          });
        } else if (key === 'tags' && Array.isArray(value)) {
          const tagsJson = JSON.stringify(value);
          console.log('Appending tags as JSON:', tagsJson);
          formData.append(key, tagsJson);
        } else if (value !== undefined && value !== null) {
          console.log(`Appending ${key}:`, value);
          formData.append(key, value.toString());
        }
      });

      console.log('Sending FormData to API...');
      const response = await api.post<ApiResponse<Task>>('/tasks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Task created successfully:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('Redux createTask - error:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (key === 'attachments' && Array.isArray(value)) {
          value.forEach((file) => {
            formData.append('attachments', file);
          });
        } else if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete task');
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, text }: { taskId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add comment');
    }
  }
);

export const removeAttachment = createAsyncThunk(
  'tasks/removeAttachment',
  async ({ taskId, attachmentId }: { taskId: string; attachmentId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      return { taskId, attachmentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove attachment');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<{ taskStats: TaskStats }>>('/tasks/stats');
      return response.data.data!.taskStats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch task statistics');
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sort: 'createdAt:desc',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          totalTasks: action.payload.count,
          hasNext: action.payload.pagination.hasNext,
          hasPrev: action.payload.pagination.hasPrev,
        };
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.currentTask && state.currentTask.id === action.payload) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentTask) {
          state.currentTask.comments.push(action.payload);
        }
      });

    // Remove attachment
    builder
      .addCase(removeAttachment.fulfilled, (state, action) => {
        const { taskId, attachmentId } = action.payload;
        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask.attachments = state.currentTask.attachments.filter(
            attachment => attachment._id !== attachmentId
          );
        }
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].attachments = state.tasks[taskIndex].attachments.filter(
            attachment => attachment._id !== attachmentId
          );
        }
      });

    // Fetch task stats
    builder
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentTask, updateTaskInList } = taskSlice.actions;
export default taskSlice.reducer;