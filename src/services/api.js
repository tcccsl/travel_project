import axios from 'axios';

// Base URL configuration
const API_URL = 'https://api-example.com'; // Replace with your actual API URL

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token interceptor
apiClient.interceptors.request.use(config => {
  // Check if it's an admin API request
  if (config.url.includes('/api/admin')) {
    const token = uni.getStorageSync('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // Regular user request
    const token = uni.getStorageSync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API endpoints
export default {
  // Diary related endpoints
  diaries: {
    getAll(params = {}) {
      return apiClient.get('/diaries', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          keyword: params.keyword
        }
      });
    },
    getById(id) {
      return apiClient.get(`/diaries/${id}`);
    },
    create(diary) {
      return apiClient.post('/diaries', diary);
    },
    update(id, diary) {
      return apiClient.put(`/diaries/${id}`, diary);
    },
    delete(id) {
      return apiClient.delete(`/diaries/${id}`);
    },
    // Get current user's diaries
    getMine() {
      return apiClient.get('/diaries/mine');
    },
    // Update diary status (admin only)
    updateStatus(id, statusData) {
      return apiClient.put(`/api/diary/${id}/status`, statusData);
    },
    // Delete diary (admin only - logical delete)
    adminDelete(id) {
      return apiClient.delete(`/api/diary/${id}/delete`);
    }
  },
  
  // User related endpoints
  users: {
    login(credentials) {
      return apiClient.post('/auth/login', credentials);
    },
    register(userData) {
      return apiClient.post('/auth/register', userData);
    },
    getProfile() {
      return apiClient.get('/auth/profile');
    },
    // Check if username is available
    checkUsername(username) {
      return apiClient.get('/auth/check-username', { params: { username } });
    },
    // Check if nickname is available
    checkNickname(nickname) {
      return apiClient.get('/auth/check-nickname', { params: { nickname } });
    }
  },
  
  // Admin related endpoints
  admin: {
    login(credentials) {
      return apiClient.post('/api/admin/login', credentials);
    },
    // Get all diaries for admin review
    getDiaries(params = {}) {
      return apiClient.get('/api/admin/diaries', {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || ''
        }
      });
    }
  }
}; 