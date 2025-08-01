import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { UserState, User, CreateUserData, UpdateUserData, PaginatedResponse, ApiResponse, UserStats } from '../../types';

// Initial state
const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get<PaginatedResponse<User>>(`/users?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const fetchAssignableUsers = createAsyncThunk(
  'users/fetchAssignableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<User[]>>('/users/assignable');
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch assignable users');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
      return response.data.data!.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: string; userData: UpdateUserData }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivateUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}/deactivate`);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to deactivate user');
    }
  }
);

export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}/activate`);
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to activate user');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<UserStats>>('/users/stats');
      return response.data.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user statistics');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination.currentPage,
          totalPages: action.payload.pagination.totalPages,
          totalUsers: action.payload.count,
          hasNext: action.payload.pagination.hasNext,
          hasPrev: action.payload.pagination.hasPrev,
        };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch assignable users
    builder
      .addCase(fetchAssignableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignableUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignableUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single user
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Deactivate user
    builder
      .addCase(deactivateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      });

    // Activate user
    builder
      .addCase(activateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      });

    // Fetch user stats
    builder
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;