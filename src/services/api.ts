import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-5f5u.onrender.com/api';
console.log(API_BASE_URL);
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  depositAmount: number;
  profitAmount: number;
  totalAmount: number;
  status: 'active' | 'blocked';
  role: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  platform: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  message: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'general';
  status: 'read' | 'unread';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

// API Methods
export const adminApi = {
  // Authentication
  login: async (email: string, password: string) => {
    return api.post('/auth/admin/login', { email, password });
  },

  // Dashboard
  getDashboardStats: async () => {
    return api.get('/admin/reports/summary');
  },

  // Users Management
  getUsers: async (page: number = 1, limit: number = 20, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return api.get(`/admin/users?${params}`);
  },

  blockUser: async (userId: string) => {
    return api.put(`/admin/users/${userId}/block`);
  },

  unblockUser: async (userId: string) => {
    return api.put(`/admin/users/${userId}/unblock`);
  },

  resetUserPassword: async (userId: string) => {
    return api.put(`/admin/users/${userId}/reset-password`);
  },

  // Deposits Management
  getDeposits: async (page: number = 1, limit: number = 20, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return api.get(`/admin/deposits?${params}`);
  },

  approveDeposit: async (depositId: string, adminNotes?: string) => {
    return api.put(`/admin/deposit/${depositId}/approve`, { adminNotes });
  },

  rejectDeposit: async (depositId: string, adminNotes?: string) => {
    return api.put(`/admin/deposit/${depositId}/reject`, { adminNotes });
  },

  // Withdrawals Management
  getWithdrawals: async (page: number = 1, limit: number = 20, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return api.get(`/admin/withdrawals?${params}`);
  },

  approveWithdrawal: async (withdrawalId: string, adminNotes?: string) => {
    return api.put(`/admin/withdraw/${withdrawalId}/approve`, { adminNotes });
  },

  rejectWithdrawal: async (withdrawalId: string, adminNotes?: string) => {
    return api.put(`/admin/withdraw/${withdrawalId}/reject`, { adminNotes });
  },

  // Notifications
  getNotifications: async (page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return api.get(`/admin/notifications?${params}`);
  },

  sendNotification: async (userId: string, message: string, type: string) => {
    return api.post('/admin/notifications', { userId, message, type });
  },

  markNotificationAsRead: async (notificationId: string) => {
    return api.put(`/admin/notifications/${notificationId}/read`);
  },

  markAllNotificationsAsRead: async () => {
    return api.put('/admin/notifications/read-all');
  },

  // Settings
  getSettings: async () => {
    return api.get('/admin/settings');
  },
  updateWalletAddress: async (address: string) => {
    return api.put('/admin/settings/wallet-address', { address });
  },

  // Admin Profile
  getAdminProfile: async () => {
    return api.get('/admin/profile');
  },
  updateAdminProfile: async (data: { firstName?: string; lastName?: string; email?: string; password?: string }) => {
    return api.put('/admin/profile', data);
  },
};

export default api;
