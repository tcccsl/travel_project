// src/stores/user.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import http from '@/utils/http';
import defaultAvatar from '@/assets/images/avater.png';

export const useUserStore = defineStore('user', () => {
    // 默认头像地址
    const DEFAULT_AVATAR = defaultAvatar;
  // 状态定义
  const userInfo = ref(null);
  const isLoggedIn = ref(false);
  const token = ref(null);

  // 获取用户信息
  const getUserInfo = () => userInfo.value;
  
  // 获取登录状态
  const getLoginStatus = () => isLoggedIn.value;
  
  // 获取token
  const getToken = () => token.value;

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = {
      ...info,
      avatar: info.avatar || info.avatarUrl || DEFAULT_AVATAR
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
  };

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  // 检查昵称是否存在
  const checkNickname = async (nickname) => {
    try {
      const res = await http.post('/user/check-nickname', { nickname });
      return res.exists;
    } catch (error) {
      console.error('检查昵称失败:', error);
      return false;
    }
  };

  // 上传头像
  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file.file);
    
    try {
      const res = await http.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.url) {
        setUserInfo({ ...userInfo.value, avatar: res.url });
      }
      return res;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const res = await http.post('/register', userData);
      return res;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  // 登录
  const login = async (account, password) => {
    try {
      const res = await http.post('/login', { account, password });
      console.log('登录响应:', res);
      
      if (res.result) {
        // 设置用户信息
        setUserInfo(res.result);
        // 设置token
        setToken(res.token || res.result.token);
        // 更新登录状态
        isLoggedIn.value = true;
      }
      
      return res;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 登出
  const logout = () => {
    userInfo.value = null;
    isLoggedIn.value = false;
    setToken(null);
    localStorage.removeItem('userInfo');
  };

  // 初始化状态（从 localStorage 恢复）
  const initState = () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedToken = localStorage.getItem('token');
    
    if (savedUserInfo) {
      const parsedUserInfo = JSON.parse(savedUserInfo);
      setUserInfo(parsedUserInfo);
      isLoggedIn.value = true;
    }
    
    if (savedToken) {
      setToken(savedToken);
    }
  };

  // 在创建 store 时初始化状态
  initState();

  return {
    // 状态
    userInfo,
    isLoggedIn,
    token,
    
    // 方法
    getUserInfo,
    getLoginStatus,
    getToken,
    setUserInfo,
    setToken,
    checkNickname,
    uploadAvatar,
    register,
    login,
    logout,
    
    // 常量
    DEFAULT_AVATAR
  };
});
