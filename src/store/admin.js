import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminStore = defineStore('admin', {
  state: () => {
    // 从持久化存储初始化状态
    const adminToken = uni.getStorageSync('admin_token') || null;
    const adminRole = uni.getStorageSync('admin_role') || null;
    
    return {
      adminToken: adminToken,
      role: adminRole,
    };
  },
  
  getters: {
    // 检查管理员是否已登录
    isAuthenticated: (state) => !!state.adminToken,
    
    // 检查是否为审核员
    isAuditor: (state) => state.role === 'auditor',
    
    // 检查是否为管理员
    isAdmin: (state) => state.role === 'admin'
  },
  
  actions: {
    // 设置管理员信息
    setAdmin(adminData) {
      if (!adminData) return;
      
      this.adminToken = adminData.token || this.adminToken;
      this.role = adminData.role || this.role;
      
      // 持久化存储
      uni.setStorageSync('admin_token', this.adminToken);
      uni.setStorageSync('admin_role', this.role);
    },
    
    // 清除管理员信息
    clearAdmin() {
      this.adminToken = null;
      this.role = null;
      
      // 清除持久化存储
      uni.removeStorageSync('admin_token');
      uni.removeStorageSync('admin_role');
    },
    
    // 管理员登录
    async login(credentials) {
      try {
        const response = await api.admin.login(credentials);
        this.setAdmin(response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    
    // 管理员登出
    logout() {
      this.clearAdmin();
    }
  }
}); 