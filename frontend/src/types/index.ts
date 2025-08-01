export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: User;
  createdBy: User;
  attachments: Attachment[];
  tags: string[];
  comments: Comment[];
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: TaskFilters;
  stats: TaskStats | null;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  'in-progress': number;
  completed: number;
  cancelled: number;
  overdue: number;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: UserStats | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  activeInLastWeek: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: T[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  dueDate: string;
  assignedTo: string;
  estimatedHours?: number;
  tags?: string[] | string;
  attachments?: File[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  actualHours?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}