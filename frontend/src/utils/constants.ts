export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: TASK_STATUS.COMPLETED, label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: TASK_STATUS.CANCELLED, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: TASK_PRIORITY.MEDIUM, label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: TASK_PRIORITY.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: TASK_PRIORITY.URGENT, label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.USER, label: 'User' },
  { value: USER_ROLES.ADMIN, label: 'Admin' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'dueDate:asc', label: 'Due Date (Earliest)' },
  { value: 'dueDate:desc', label: 'Due Date (Latest)' },
  { value: 'priority:desc', label: 'Priority (High to Low)' },
  { value: 'priority:asc', label: 'Priority (Low to High)' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
];

export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: '10 per page' },
  { value: 25, label: '25 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' },
];

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_TASK = 3;
export const ALLOWED_FILE_TYPES = ['application/pdf'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  CREATE_TASK: '/tasks/create',
  EDIT_TASK: '/tasks/:id/edit',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  CREATE_USER: '/users/create',
  EDIT_USER: '/users/:id/edit',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;