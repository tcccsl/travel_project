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
    // 初始化管理员信息
    init() {
      // 从持久化存储重新加载
      const adminToken = uni.getStorageSync('admin_token') || null;
      const adminRole = uni.getStorageSync('admin_role') || null;
      
      this.adminToken = adminToken;
      this.role = adminRole;
      
      return {
        adminToken,
        role: adminRole,
        isAuthenticated: !!adminToken
      };
    },
    
    // 设置管理员信息
    setAdmin(adminData) {
      if (!adminData) {
        console.error('设置管理员信息失败: 数据为空');
        return;
      }
      
      // 直接从 adminData 中取值
      this.adminToken = adminData.token || null;
      this.role = adminData.role || null;
      
      // 持久化存储
      try {
        uni.setStorageSync('admin_token', this.adminToken);
        uni.setStorageSync('admin_role', this.role);
      } catch (e) {
        console.error('保存到本地存储失败:', e);
      }
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
        
        // 数据提取逻辑 - 尝试多种可能的数据结构
        let adminData = null;
        
        // 检查不同层次的响应数据
        if (response) {
          // 1. 检查直接响应对象
          if (response.token && response.role) {
            adminData = response;
          }
          
          // 2. 检查 response.data (axios 标准响应格式)
          const axiosData = response.data;
          if (axiosData) {
            // 2.1 数据在 response.data 直接层
            if (axiosData.token && axiosData.role) {
              adminData = axiosData;
            }
            
            // 2.2 标准后端响应格式 { code, msg, data }
            else if (axiosData.code === 200 && axiosData.data) {
              if (axiosData.data.token && axiosData.data.role) {
                adminData = axiosData.data;
              }
            }
          }
        }
        
        // 如果找到了有效的管理员数据，保存它
        if (adminData && adminData.token) {
          this.setAdmin(adminData);
          return response;
        } else {
          // 尝试深度搜索
          const rawData = response.data;
          if (rawData && typeof rawData === 'object') {
            // 深度遍历，查找包含 token 和 role 的对象
            const findAdminData = (obj) => {
              // 检查当前对象是否包含 token 和 role
              if (obj.token && obj.role) {
                return obj;
              }
              
              // 递归检查子对象
              for (const key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                  const result = findAdminData(obj[key]);
                  if (result) return result;
                }
              }
              
              return null;
            };
            
            const foundData = findAdminData(rawData);
            if (foundData) {
              this.setAdmin(foundData);
              return response;
            }
          }
          
          console.error('登录响应中未找到有效的管理员数据');
          throw new Error('登录响应格式不正确或缺少管理员数据');
        }
      } catch (error) {
        console.error('登录错误:', error);
        throw error;
      }
    },
    
    // 管理员登出
    logout() {
      this.clearAdmin();
    }
  }
}); 