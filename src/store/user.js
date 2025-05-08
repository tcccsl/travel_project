import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => {
    // 从持久化存储初始化状态
    const token = uni.getStorageSync('user_token') || null;
    const userInfo = uni.getStorageSync('user_info') || null;
    
    return {
      token: token,
      username: userInfo ? userInfo.username : null,
      nickname: userInfo ? userInfo.nickname : null,
      avatar: userInfo ? userInfo.avatar : null,
      userId: userInfo ? userInfo.id : null
    };
  },
  
  getters: {
    // 检查用户是否已登录
    isAuthenticated: (state) => !!state.token,
    
    // 获取用户完整信息
    user: (state) => {
      if (!state.username) return null;
      
      return {
        id: state.userId,
        username: state.username,
        nickname: state.nickname,
        avatar: state.avatar
      };
    }
  },
  
  actions: {
    // 设置用户信息
    setUser(userData) {
      if (!userData) return;
      
      this.token = userData.token || this.token;
      this.username = userData.user?.username || userData.username || this.username;
      this.nickname = userData.user?.nickname || userData.nickname || this.nickname;
      this.avatar = userData.user?.avatar || userData.avatar || this.avatar;
      this.userId = userData.user?.id || userData.id || this.userId;
      
      // 持久化存储
      uni.setStorageSync('user_token', this.token);
      uni.setStorageSync('token', this.token);
      console.log('setUser called, token:', this.token); 

      uni.setStorageSync('user_info', {
        id: this.userId,
        username: this.username,
        nickname: this.nickname,
        avatar: this.avatar
      });
    },
    
    // 清除用户信息
    clearUser() {
      this.token = null;
      this.username = null;
      this.nickname = null;
      this.avatar = null;
      this.userId = null;
      
      // 清除持久化存储
      uni.removeStorageSync('user_token');
      uni.removeStorageSync('user_info');
    },
    
    // 登录用户
    async login(credentials) {
      try {
        const response = await api.users.login(credentials);
        this.setUser(response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    
    // 登出用户
    logout() {
      this.clearUser();
      
      // 同时清理相关的游记缓存数据
      uni.removeStorageSync('home_diaries_cache');
      uni.removeStorageSync('my_diaries_cache');
      uni.removeStorageSync('current_diary');
      uni.removeStorageSync('diary_detail_cache_');
    },
    
    // 更新用户信息
    updateUserInfo(userInfo) {
      const data = {
        user: {
          ...this.user,
          ...userInfo
        }
      };
      this.setUser(data);
    }
  }
}); 