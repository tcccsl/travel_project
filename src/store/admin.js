import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admin: null,
    token: null,
    role: null,
    isLoggedIn: false,
    loading: false,
    error: null
  }),
  
  getters: {
    // Get current admin
    currentAdmin: (state) => state.admin,
    
    // Check if admin is authenticated
    isAuthenticated: (state) => state.isLoggedIn && !!state.token,
    
    // Check if admin is an auditor
    isAuditor: (state) => state.role === 'auditor',
    
    // Check if admin is an admin (full privileges)
    isAdmin: (state) => state.role === 'admin'
  },
  
  actions: {
    // Admin login
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.admin.login(credentials);
        this.setAdminData(response.data);
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Set admin data after successful authentication
    setAdminData(data) {
      this.admin = data.admin;
      this.token = data.token;
      this.role = data.role;
      this.isLoggedIn = true;
      
      // Save token to localStorage
      uni.setStorageSync('admin_token', data.token);
      uni.setStorageSync('admin_role', data.role);
    },
    
    // Logout admin
    logout() {
      this.admin = null;
      this.token = null;
      this.role = null;
      this.isLoggedIn = false;
      
      // Remove token from localStorage
      uni.removeStorageSync('admin_token');
      uni.removeStorageSync('admin_role');
    },
    
    // Initialize store with saved token
    init() {
      const token = uni.getStorageSync('admin_token');
      const role = uni.getStorageSync('admin_role');
      if (token) {
        this.token = token;
        this.role = role;
        this.isLoggedIn = true;
      }
    }
  }
}); 