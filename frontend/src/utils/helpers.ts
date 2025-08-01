import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from './constants';

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const isOverdue = (dueDate: string, status: string): boolean => {
  if (status === 'completed' || status === 'cancelled') return false;
  try {
    return isAfter(new Date(), parseISO(dueDate));
  } catch (error) {
    return false;
  }
};

export const getDaysUntilDue = (dueDate: string): number => {
  try {
    const due = parseISO(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

export const getStatusColor = (status: string): string => {
  const statusOption = TASK_STATUS_OPTIONS.find(option => option.value === status);
  return statusOption?.color || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority: string): string => {
  const priorityOption = TASK_PRIORITY_OPTIONS.find(option => option.value === priority);
  return priorityOption?.color || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string): string => {
  const statusOption = TASK_STATUS_OPTIONS.find(option => option.value === status);
  return statusOption?.label || status;
};

export const getPriorityLabel = (priority: string): string => {
  const priorityOption = TASK_PRIORITY_OPTIONS.find(option => option.value === priority);
  return priorityOption?.label || priority;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const getTaskPriorityOrder = (priority: string): number => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  return priorityOrder[priority as keyof typeof priorityOrder] || 0;
};

export const sortTasksByPriority = (tasks: any[]): any[] => {
  return [...tasks].sort((a, b) => getTaskPriorityOrder(b.priority) - getTaskPriorityOrder(a.priority));
};

export const filterTasksByStatus = (tasks: any[], status: string): any[] => {
  if (!status) return tasks;
  return tasks.filter(task => task.status === status);
};

export const searchTasks = (tasks: any[], searchTerm: string): any[] => {
  if (!searchTerm) return tasks;
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(term) ||
    task.description.toLowerCase().includes(term) ||
    task.tags.some((tag: string) => tag.toLowerCase().includes(term))
  );
};

export const getOverdueTasks = (tasks: any[]): any[] => {
  return tasks.filter(task => isOverdue(task.dueDate, task.status));
};

export const getTasksDueSoon = (tasks: any[], days: number = 3): any[] => {
  return tasks.filter(task => {
    const daysUntil = getDaysUntilDue(task.dueDate);
    return daysUntil <= days && daysUntil >= 0 && task.status !== 'completed' && task.status !== 'cancelled';
  });
};

export const calculateTaskProgress = (tasks: any[]): { completed: number; total: number; percentage: number } => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
};