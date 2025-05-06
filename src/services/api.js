import axios from 'axios';
import { useUserStore } from '../store/user';
import { useAdminStore } from '../store/admin';

// Base URL configuration
const API_URL = 'http://localhost:3000'; //actual API URL

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

// 在 services/api.js 中添加请求拦截器
const requestInterceptor = {
  request: (config) => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      headers: config.header,
      data: config.data
    });
    return config;
  },
  response: (response) => {
    console.log('收到响应:', response);
    return response;
  }
};

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
      console.log('获取游记详情, ID:', id);
      return apiClient.get(`/diaries/${id}`)
        .then(response => {
          console.log('获取游记详情原始响应:', response);
          
          // 检查响应格式并适应不同的数据结构
          if (response.data && typeof response.data === 'object') {
            // 标准格式: { code: 200, msg: "获取成功", data: { ... } }
            if (response.data.code === 200 && response.data.data) {
              console.log('标准格式响应:', response.data);
              return response.data;
            }
            
            // 直接返回数据对象格式
            if (response.data.id && (response.data.title || response.data.content)) {
              console.log('直接数据对象格式:', response.data);
              return {
                code: 200,
                msg: "获取成功",
                data: response.data
              };
            }
            
            // 其他格式，尝试适配
            console.log('其他格式响应:', response.data);
            return {
              code: response.data.code || 200,
              msg: response.data.msg || "获取成功",
              data: response.data.data || response.data
            };
          }
          
          // 无法识别的格式
          console.warn('无法识别的响应格式:', response);
          return response;
        })
        .catch(error => {
          console.error('获取游记详情失败:', error.response || error);
          throw error;
        });
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
      return apiClient.post('/api/admin/login', credentials)
        .then(response => {
          // 针对后端的特定响应格式进行处理
          if (response.data && typeof response.data === 'object') {
            // 标准格式: { code: 200, msg: "登录成功", data: { token: "...", role: "..." } }
            if (response.data.code === 200 && response.data.data) {
              return {
                data: response.data.data
              };
            }
          }
          
          return response;
        })
        .catch(error => {
          console.error('管理员登录失败:', error.response || error);
          throw error;
        });
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
    },
    // 获取单个游记详情（管理员视图）
    getDiaryById(id) {
      console.log('管理员获取游记详情, ID:', id);
      return apiClient.get(`/api/admin/diaries/${id}`)
        .then(response => {
          console.log('管理员获取游记详情原始响应:', response);
          // 检查响应格式
          if (response.data && typeof response.data === 'object') {
            console.log('管理员获取游记详情数据:', response.data);
            return response.data;
          }
          return response;
        })
        .catch(error => {
          console.error('管理员获取游记详情失败:', error.response || error);
          throw error;
        });
    }
  },

  // File upload endpoints
  upload: {
    // Upload file using FormData
    file(formData) {
      console.log('开始上传文件到服务器');
      return uploadClient.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('上传进度:', percentCompleted + '%');
        }
      }).then(response => {
        console.log('文件上传成功，服务器返回:', response.data);
        // 修改判断逻辑，适应后端返回的数据结构
        if (!response.data || response.data.code !== 200 || !response.data.data || !response.data.data.url) {
          console.error('服务器返回数据格式不正确:', response.data);
          throw new Error(response.data?.msg || '服务器返回数据格式不正确');
        }
        // 直接返回需要的 URL 数据
        return response.data.data;
      }).catch(error => {
        console.error('文件上传失败:', error.response || error);
        // 如果是网络错误
        if (error.isAxiosError && !error.response) {
          console.error('网络错误或服务器未响应');
        }
        // 如果是服务器错误
        else if (error.response) {
          console.error('服务器返回错误:', error.response.status, error.response.data);
        }
        throw error;
      });
    },
    
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