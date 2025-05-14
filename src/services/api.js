import axios from 'axios';
import { useUserStore } from '../store/user';
import { useAdminStore } from '../store/admin';
import { uploadFile } from '@/utils/upload.js';

// Base URL configuration
const API_URL = 'http://121.40.88.145:3000'; //actual API URL

// 针对Android环境的调试函数
const debugLog = (message, data) => {
  // #ifdef APP-PLUS
  if (uni.getSystemInfoSync().platform === 'android') {
    console.log(`[Android Debug] ${message}`, data);
  }
  // #endif
  
  // 普通环境只在开发模式记录日志
  // #ifdef APP-PLUS-NVUE
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
  // #endif
};

// 确保URL有正确的协议头
const ensureHttpUrl = (url) => {
  if (!url) return url;
  if (!url.startsWith('http')) {
    return 'http://' + url;
  }
  return url;
};

// 针对大文件上传，增加超时时间
const UPLOAD_TIMEOUT = 60000; // 60秒超时

// 添加移动端兼容性处理
const isMobileApp = () => {
  // #ifdef APP-PLUS
  return true;
  // #endif
  return false;
};

// uni.request 实现 - 在移动应用上优先使用这个
const uniRequest = (options) => {
  return new Promise((resolve, reject) => {
    // 确保URL有正确格式
    const requestUrl = options.url.startsWith('http') ? 
      options.url : 
      `${API_URL}${options.url.startsWith('/') ? options.url : '/' + options.url}`;
    
    // 使用调试函数记录请求
    debugLog('使用uni.request发送请求:', {
      url: requestUrl,
      method: options.method || 'GET',
      data: options.data || options.params
    });
    
    // 准备请求头
    const headers = options.headers || {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // 添加授权头
    const userStore = useUserStore();
    const adminStore = useAdminStore();
    
    if (options.url && options.url.includes('/api/admin')) {
      if (adminStore.adminToken) {
        headers.Authorization = `Bearer ${adminStore.adminToken}`;
      }
    } else {
      if (userStore.token) {
        headers.Authorization = `Bearer ${userStore.token}`;
      }
    }
    
    // 在Android平台上添加更详细的调试信息
    if (uni.getSystemInfoSync().platform === 'android') {
      debugLog('Android平台发送请求:', {
        url: requestUrl,
        method: options.method || 'GET',
        headers: headers,
        data: options.data || options.params
      });
      
      // 测试网络连接
      uni.getNetworkType({
        success: function(res) {
          debugLog('当前网络状态:', res.networkType);
        }
      });
    }
    
    // 设置超时处理
    let requestTimeout = null;
    const DEFAULT_TIMEOUT = 30000; // 30秒
    
    requestTimeout = setTimeout(() => {
      debugLog('请求超时，自动取消', requestUrl);
      uni.showToast({
        title: '请求超时，请检查网络',
        icon: 'none',
        duration: 3000
      });
      reject(new Error('请求超时'));
    }, DEFAULT_TIMEOUT);
    
    uni.request({
      url: ensureHttpUrl(requestUrl),
      data: options.data || options.params,
      method: options.method || 'GET',
      header: headers,
      timeout: 30000, // 30秒
      success: (res) => {
        // 清除超时
        if (requestTimeout) clearTimeout(requestTimeout);
        
        debugLog('uni.request 成功响应:', res);
        // 格式化成与axios兼容的响应格式
        resolve({
          data: res.data,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header
        });
      },
      fail: (err) => {
        // 清除超时
        if (requestTimeout) clearTimeout(requestTimeout);
        
        debugLog('uni.request 失败:', err);
        
        // 增加更详细的错误信息
        if (uni.getSystemInfoSync().platform === 'android') {
          debugLog('Android 请求失败详情:', {
            errMsg: err.errMsg,
            errno: err.errno,
            headers: headers,
            url: requestUrl
          });
          
          // 展示错误提示给用户
          uni.showToast({
            title: `请求失败: ${err.errMsg || '未知错误'}`,
            icon: 'none',
            duration: 3000
          });
        }
        
        reject(err);
      }
    });
  });
};

// 根据平台选择请求方法
const request = (options) => {
  // #ifdef APP-PLUS
  // 移动应用使用uni.request
  return uniRequest(options);
  // #endif

  // #ifdef H5
  // 浏览器环境使用axios
  return apiClient(options);
  // #endif

  // 默认使用uni.request
  return uniRequest(options);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
  // 确保URL中包含完整的协议
  if (config.url && !config.url.startsWith('http')) {
    // 如果是相对URL，确保基础URL包含http://
    if (!config.baseURL.startsWith('http')) {
      config.baseURL = 'http://' + config.baseURL;
    }
  }
  
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
  
  // 打印请求信息用于调试
  console.log('发送请求配置:', {
    url: config.url,
    baseURL: config.baseURL,
    method: config.method,
    headers: config.headers
  });
  
  return config;
};

apiClient.interceptors.request.use(addAuthToken, error => {
  return Promise.reject(error);
});

uploadClient.interceptors.request.use(addAuthToken, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API请求错误:', error);
    
    // 检查Android特定错误
    // #ifdef APP-PLUS
    if (uni.getSystemInfoSync().platform === 'android') {
      console.error('Android平台API错误:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // 收集Android错误消息
      let errorMessage = '连接服务器失败';
      if (error.message) {
        if (error.message.includes('ECONNREFUSED')) {
          errorMessage = '无法连接到服务器，请检查网络';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        } else if (error.message.includes('Network Error')) {
          errorMessage = '网络错误，请检查网络连接';
        } else if (error.message.includes('certificate')) {
          errorMessage = '网络连接安全错误';
        }
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      });
      
      // 尝试使用uni.request替代
      if (error.config) {
        console.log('尝试使用uni.request发送请求');
        return uniRequest({
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        });
      }
    }
    // #endif
    
    // 处理网络错误
    if (!error.response) {
      console.error('网络错误，可能是CORS或服务器未响应');
      uni.showToast({
        title: '网络连接错误，请检查网络设置',
        icon: 'none',
        duration: 3000
      });
    } else {
      // 处理HTTP状态码错误
      switch (error.response.status) {
        case 401:
          console.error('未授权访问，可能需要重新登录');
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          
          // 清除登录状态
          const userStore = useUserStore();
          userStore.logout();
          
          // 延迟跳转到登录页
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/Login/Login'
            });
          }, 1000);
          break;
          
        case 403:
          console.error('禁止访问，权限不足');
          uni.showToast({
            title: '您没有权限执行此操作',
            icon: 'none'
          });
          break;
          
        case 404:
          console.error('资源不存在:', error.config.url);
          break;
          
        case 500:
          console.error('服务器内部错误');
          uni.showToast({
            title: '服务器错误，请稍后重试',
            icon: 'none'
          });
          break;
          
        default:
          console.error(`HTTP错误 ${error.response.status}`);
      }
    }
    
    return Promise.reject(error);
  }
);

// 为上传请求添加同样的错误处理
uploadClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('上传请求错误:', error);
    
    if (!error.response) {
      uni.showToast({
        title: '网络连接错误，请检查网络设置',
        icon: 'none',
        duration: 3000
      });
    }
    
    return Promise.reject(error);
  }
);

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

// API endpoints with platform adaptations
export default {
  // Diary related endpoints
  diaries: {
    getAll(params = {}) {
      return request({
        url: '/api/diaries',
        method: 'GET',
        params
      });
    },
    getById(id) {
      return request({
        url: `/api/diaries/${id}`,
        method: 'GET'
      }).then(response => {
        console.log('获取游记详情原始响应:', response);
        
        // 处理响应数据
        if (response.data && typeof response.data === 'object') {
          // 如果响应已经是标准格式
          if (response.data.code === 200 && response.data.data) {
            return response.data;
          }
          
          // 如果响应是直接的数据对象
          if (response.data.id) {
            return {
              code: 200,
              msg: "获取成功",
              data: response.data
            };
          }
          
          // 其他情况，尝试适配
          return {
            code: response.data.code || 200,
            msg: response.data.msg || "获取成功",
            data: response.data.data || response.data
          };
        }
        
        // 如果响应不是对象，直接返回
        return response;
      }).catch(error => {
        console.error('获取游记详情失败:', error);
        throw error;
      });
    },
    create(diary) {
      return request({
        url: '/api/diaries',
        method: 'POST',
        data: diary
      });
    },
    update(id, diary) {
      return request({
        url: `/api/diaries/${id}`,
        method: 'PUT',
        data: diary
      });
    },
    delete(id) {
      return request({
        url: `/api/diaries/${id}`,
        method: 'DELETE'
      });
    },
    getMine() {
      return request({
        url: '/api/diaries/mine',
        method: 'GET'
      });
    },
    updateStatus(id, statusData) {
      return request({
        url: `/api/diary/${id}/status`,
        method: 'PUT',
        data: statusData
      });
    },
    adminDelete(id) {
      return request({
        url: `/api/admin/diary/${id}/delete`,
        method: 'DELETE'
      });
    },
    image({ file, filePath, token, onProgress }) {
      console.log('准备上传图片:', { file, filePath });
      
      // #ifdef APP-PLUS
      // 手机端直接使用upload.image方法，保持一致性
      return this.upload.image({ file, filePath, token, onProgress });
      // #endif
      
      // 浏览器端使用常规方法
      return uploadFile({
        url: `${API_URL}/api/upload/image`,
        file,
        filePath,
        token,
        onProgress
      });
    }
  },
  
  // User related endpoints
  users: {
    login(credentials) {
      if (isMobileApp()) {
        return uniRequest({
          url: '/auth/login',
          method: 'POST',
          data: credentials
        });
      } else {
        return apiClient.post('/auth/login', credentials);
      }
    },
    
    register(userData) {
      if (isMobileApp()) {
        return uniRequest({
          url: '/auth/register',
          method: 'POST',
          data: userData
        });
      } else {
        return apiClient.post('/auth/register', userData);
      }
    },
    
    getProfile() {
      if (isMobileApp()) {
        return uniRequest({
          url: '/auth/profile',
          method: 'GET'
        });
      } else {
        return apiClient.get('/auth/profile');
      }
    },
    
    checkUsername(username) {
      if (isMobileApp()) {
        return uniRequest({
          url: '/auth/check-username',
          method: 'GET',
          params: { username }
        });
      } else {
        return apiClient.get('/auth/check-username', { params: { username } });
      }
    },
    
    checkNickname(nickname) {
      if (isMobileApp()) {
        return uniRequest({
          url: '/auth/check-nickname',
          method: 'GET',
          params: { nickname }
        });
      } else {
        return apiClient.get('/auth/check-nickname', { params: { nickname } });
      }
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
      }).then(response => {
        // 处理响应格式
        if (response.data && typeof response.data === 'object') {
          // 标准格式: { code: 200, msg: "获取成功", data: { total: 15, list: [...] } }
          if (response.data.code !== undefined) {
            return response.data;
          }
          
          // 直接返回数据格式，需要封装
          return {
            code: 200,
            msg: "获取成功",
            data: response.data
          };
        }
        
        return response;
      }).catch(error => {
        throw error;
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
    // 统一图片上传
    image({ file, filePath, token, onProgress }) {
      if (isMobileApp()) {
        // 移动端使用uni.uploadFile
        return new Promise((resolve, reject) => {
          console.log('移动端环境，使用uni.uploadFile上传图片');
          
          // 确保使用完整的URL (包含http://)
          const uploadUrl = ensureHttpUrl(`${API_URL}/api/upload/image`);
          console.log('图片上传URL:', uploadUrl);
          
          // 确保filePath存在
          if (!filePath) {
            console.error('上传错误: 未提供filePath');
            uni.showToast({
              title: '上传失败: 未找到文件路径',
              icon: 'none',
              duration: 3000
            });
            reject(new Error('未提供filePath'));
            return;
          }
          
          // 检查文件是否存在
          uni.getFileInfo({
            filePath: filePath,
            success: (fileInfo) => {
              console.log('文件信息:', fileInfo);
              
              const uploadTask = uni.uploadFile({
                url: uploadUrl,
                filePath: filePath,
                name: 'file',
                header: {
                  'Authorization': token ? `Bearer ${token}` : ''
                },
                formData: {
                  // 可以添加额外参数
                  platform: 'android',
                  timestamp: Date.now()
                },
                success: (res) => {
                  console.log('上传成功，响应码:', res.statusCode);
                  console.log('上传成功，响应内容:', res.data);
                  
                  if (res.statusCode === 200) {
                    try {
                      // 尝试解析JSON响应
                      const resultData = JSON.parse(res.data);
                      console.log('解析的响应数据:', resultData);
                      resolve(resultData);
                    } catch (e) {
                      console.warn('响应数据不是有效JSON:', e);
                      // 如果不是JSON，尝试作为URL字符串处理
                      if (typeof res.data === 'string' && res.data.includes('http')) {
                        resolve({ 
                          code: 200,
                          msg: "上传成功",
                          data: { url: res.data.trim() }
                        });
                      } else {
                        // 返回一个通用成功对象
                        resolve({
                          code: 200,
                          msg: "上传成功，但响应格式异常",
                          data: { url: res.data }
                        });
                      }
                    }
                  } else {
                    // 处理非200状态码
                    console.error('上传失败，状态码:', res.statusCode);
                    uni.showToast({
                      title: `上传失败: 服务器返回 ${res.statusCode}`,
                      icon: 'none',
                      duration: 3000
                    });
                    reject(new Error('上传失败: ' + res.statusCode));
                  }
                },
                fail: (err) => {
                  console.error('上传失败:', err);
                  // 显示更友好的错误信息
                  let errorMsg = '上传失败';
                  if (err.errMsg) {
                    if (err.errMsg.includes('timeout')) {
                      errorMsg = '上传超时，请检查网络';
                    } else if (err.errMsg.includes('fail')) {
                      errorMsg = '上传失败，请检查网络连接';
                    }
                  }
                  
                  uni.showToast({
                    title: errorMsg,
                    icon: 'none',
                    duration: 3000
                  });
                  reject(err);
                }
              });
              
              // 添加上传进度回调
              if (onProgress && uploadTask.onProgressUpdate) {
                uploadTask.onProgressUpdate((res) => {
                  console.log('上传进度:', res.progress + '%');
                  onProgress({
                    loaded: res.totalBytesSent,
                    total: res.totalBytesExpectedToSend,
                    progress: res.progress / 100
                  });
                });
              }
            },
            fail: (err) => {
              console.error('获取文件信息失败:', err);
              uni.showToast({
                title: '文件不存在或已损坏',
                icon: 'none',
                duration: 3000
              });
              reject(new Error('文件不存在'));
            }
          });
        });
      } else {
        // 浏览器端使用常规方法
        return uploadFile({
          url: `${API_URL}/api/upload/image`,
          file,
          filePath,
          token,
          onProgress
        });
      }
    },
    
    // 统一视频上传
    video({ file, filePath, token, onProgress }) {
      if (isMobileApp()) {
        // 移动端使用uni.uploadFile
        return new Promise((resolve, reject) => {
          console.log('移动端环境，使用uni.uploadFile上传视频');
          
          // 确保使用完整的URL (包含http://)
          const uploadUrl = ensureHttpUrl(`${API_URL}/api/upload/video`);
          console.log('视频上传URL:', uploadUrl);
          
          // 确保filePath存在
          if (!filePath) {
            console.error('上传错误: 未提供filePath');
            uni.showToast({
              title: '上传失败: 未找到文件路径',
              icon: 'none',
              duration: 3000
            });
            reject(new Error('未提供filePath'));
            return;
          }
          
          // 检查文件是否存在
          uni.getFileInfo({
            filePath: filePath,
            success: (fileInfo) => {
              console.log('文件信息:', fileInfo);
              
              // 对于大文件，给用户提供压缩选项
              if (fileInfo.size > 10 * 1024 * 1024) { // 大于10MB
                uni.showModal({
                  title: '视频文件较大',
                  content: '是否要压缩视频以加快上传速度？',
                  confirmText: '压缩',
                  cancelText: '原始上传',
                  success: (res) => {
                    if (res.confirm) {
                      // 压缩视频
                      this.compressAndUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
                    } else {
                      // 直接上传原始视频
                      this.doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
                    }
                  }
                });
              } else {
                // 小文件直接上传
                this.doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
              }
            },
            fail: (err) => {
              console.error('获取文件信息失败:', err);
              uni.showToast({
                title: '文件不存在或已损坏',
                icon: 'none',
                duration: 3000
              });
              reject(new Error('文件不存在'));
            }
          });
        });
      } else {
        // 浏览器端使用常规方法
        return uploadFile({
          url: `${API_URL}/api/upload/video`,
          file,
          filePath,
          token,
          onProgress
        });
      }
    },
    
    // 压缩视频然后上传
    compressAndUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject) {
      // 仅在APP中支持视频压缩
      // #ifdef APP-PLUS
      uni.showLoading({
        title: '压缩视频中...'
      });
      
      const compressOptions = {
        src: filePath,
        quality: 'medium', // 压缩质量
        bitrate: 1 * 1024 * 1024, // 码率1Mbps
        fps: 24, // 帧率
        success: (compressedVideo) => {
          uni.hideLoading();
          console.log('视频压缩完成:', compressedVideo);
          
          // 上传压缩后的视频
          this.doUploadVideo(compressedVideo.tempFilePath, uploadUrl, token, onProgress, resolve, reject);
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('视频压缩失败:', err);
          uni.showToast({
            title: '压缩失败，将上传原始视频',
            icon: 'none',
            duration: 2000
          });
          
          // 压缩失败，上传原始视频
          setTimeout(() => {
            this.doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
          }, 1000);
        }
      };
      
      // 尝试调用压缩API
      try {
        uni.compressVideo(compressOptions);
      } catch(e) {
        uni.hideLoading();
        console.error('压缩视频API不可用:', e);
        // 如果API不可用，直接上传原始视频
        this.doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
      }
      // #endif
      
      // 其他平台直接上传原视频
      // #ifndef APP-PLUS
      this.doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject);
      // #endif
    },
    
    // 实际上传视频
    doUploadVideo(filePath, uploadUrl, token, onProgress, resolve, reject) {
      const uploadTask = uni.uploadFile({
        url: uploadUrl,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        formData: {
          // 可以添加额外参数
          platform: 'android',
          timestamp: Date.now()
        },
        success: (res) => {
          console.log('上传成功，响应码:', res.statusCode);
          console.log('上传成功，响应内容:', res.data);
          
          if (res.statusCode === 200) {
            try {
              // 尝试解析JSON响应
              const resultData = JSON.parse(res.data);
              console.log('解析的响应数据:', resultData);
              resolve(resultData);
            } catch (e) {
              console.warn('响应数据不是有效JSON:', e);
              // 如果不是JSON，尝试作为URL字符串处理
              if (typeof res.data === 'string' && res.data.includes('http')) {
                resolve({ 
                  code: 200,
                  msg: "上传成功",
                  data: { url: res.data.trim() }
                });
              } else {
                // 返回一个通用成功对象
                resolve({
                  code: 200,
                  msg: "上传成功，但响应格式异常",
                  data: { url: res.data }
                });
              }
            }
          } else {
            // 处理非200状态码
            console.error('上传失败，状态码:', res.statusCode);
            uni.showToast({
              title: `上传失败: 服务器返回 ${res.statusCode}`,
              icon: 'none',
              duration: 3000
            });
            reject(new Error('上传失败: ' + res.statusCode));
          }
        },
        fail: (err) => {
          console.error('上传失败:', err);
          // 显示更友好的错误信息
          let errorMsg = '上传失败';
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errorMsg = '上传超时，请检查网络';
            } else if (err.errMsg.includes('fail')) {
              errorMsg = '上传失败，请检查网络连接';
            }
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
          reject(err);
        }
      });
      
      // 添加上传进度回调
      if (onProgress && uploadTask.onProgressUpdate) {
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度:', res.progress + '%');
          onProgress({
            loaded: res.totalBytesSent,
            total: res.totalBytesExpectedToSend,
            progress: res.progress / 100
          });
        });
      }
    }
  }
};