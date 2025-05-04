import axios from 'axios';
import { useUserStore } from '../store/user';
import { useAdminStore } from '../store/admin';

// Base URL configuration
const API_URL = 'https://api-example.com'; // Replace with your actual API URL

// 针对大文件上传，增加超时时间
const UPLOAD_TIMEOUT = 60000; // 60秒超时

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 创建专用于上传的axios实例，超时时间更长
const uploadClient = axios.create({
  baseURL: API_URL,
  timeout: UPLOAD_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token interceptor for both clients
const addAuthToken = config => {
  // 检查是否是 admin API 请求
  if (config.url.includes('/api/admin')) {
    // 使用 admin store 的 token
    const adminStore = useAdminStore();
    if (adminStore.adminToken) {
      config.headers.Authorization = `Bearer ${adminStore.adminToken}`;
    }
  } else {
    // 普通用户请求使用 user store 的 token
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
  }
  return config;
};

apiClient.interceptors.request.use(addAuthToken, error => {
  return Promise.reject(error);
});

uploadClient.interceptors.request.use(addAuthToken, error => {
  return Promise.reject(error);
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
  },

  // File upload endpoints
  upload: {
    // Upload image as base64 data URL
    image(imageBase64) {
      console.log('开始上传图片，dataURL长度:', imageBase64.length);
      return uploadClient.post('/api/upload/image', {
        image: imageBase64
      }).then(response => {
        console.log('图片上传成功，服务器返回:', response.data);
        if (response.data && response.data.url) {
          console.log('返回的URL:', response.data.url);
        } else {
          console.warn('服务器未返回有效的URL:', response.data);
        }
        return response;
      }).catch(error => {
        console.error('图片上传失败:', error.response || error);
        
        // 如果是超时错误，提供更具体的错误信息
        if (error.code === 'ECONNABORTED') {
          console.error('上传超时，可能是文件过大或网络问题');
        }
        
        throw error;
      });
    },
    // Upload video as base64 data URL
    video(videoBase64) {
      console.log('开始上传视频，dataURL长度:', videoBase64.length);
      return uploadClient.post('/api/upload/video', {
        video: videoBase64
      }).then(response => {
        console.log('视频上传成功，服务器返回:', response.data);
        if (response.data && response.data.url) {
          console.log('返回的URL:', response.data.url);
        } else {
          console.warn('服务器未返回有效的URL:', response.data);
        }
        return response;
      }).catch(error => {
        console.error('视频上传失败:', error.response || error);
        
        // 如果是超时错误，提供更具体的错误信息
        if (error.code === 'ECONNABORTED') {
          console.error('上传超时，可能是文件过大或网络问题');
        }
        
        throw error;
      });
    }
  }
}; 