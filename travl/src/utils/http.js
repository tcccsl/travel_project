// axios基础封装
import axios from "axios"
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const http = axios.create({
  baseURL: 'http://pcapi-xiaotuxian-front-devtest.itheima.net', // 确保这里是你的后端API地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 拦截器

// axios请求拦截器
http.interceptors.request.use(
  config => {
    // 从 Pinia store 获取 token
    const userStore = useUserStore();
    const token = userStore.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// axios响应拦截器
http.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const userStore = useUserStore();
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          ElMessage.error('请求错误');
          break;
        case 401:
          ElMessage.error('未授权，请重新登录');
          // 清除登录状态
          userStore.logout();
          // 跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求错误，未找到该资源');
          break;
        case 500:
          ElMessage.error('服务器端出错');
          break;
        default:
          ElMessage.error(`连接错误${error.response.status}`);
      }
    } else {
      ElMessage.error('连接到服务器失败');
    }
    return Promise.reject(error);
  }
);

export default http; 