<template>
  <view class="container">
    <view class="login-card">
      <!-- Title -->
      <view class="header">
        <text class="title">管理员登录</text>
      </view>
      
      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Username Input -->
        <view class="form-item">
          <view class="input-container" :class="{ 'error': errors.username }">
            <text class="input-icon"><i class="fas fa-user"></i></text>
            <input 
              type="text" 
              v-model="formData.username" 
              class="input" 
              placeholder="用户名" 
              :disabled="loading"
            />
          </view>
          <text class="error-tip" v-if="errors.username">{{ errors.username }}</text>
        </view>
        
        <!-- Password Input -->
        <view class="form-item">
          <view class="input-container" :class="{ 'error': errors.password }">
            <text class="input-icon"><i class="fas fa-lock"></i></text>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="formData.password" 
              class="input" 
              placeholder="密码" 
              :disabled="loading"
            />
            <text class="toggle-password" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </text>
          </view>
          <text class="error-tip" v-if="errors.password">{{ errors.password }}</text>
        </view>
        
        <!-- Login Button -->
        <button 
          class="login-button" 
          :class="{ 'loading': loading }" 
          :disabled="loading" 
          @click="handleSubmit"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        
        <!-- Back to Home Link -->
        <view class="home-link">
          <text class="link" @click="goToHome">返回首页</text>
        </view>
      </form>
    </view>
  </view>
</template>

<script>
import { useAdminStore } from '@/store/admin.js';

export default {
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      errors: {
        username: '',
        password: ''
      },
      loading: false,
      showPassword: false
    }
  },
  onLoad() {
    // Check if already logged in
    const adminStore = useAdminStore();
    if (adminStore.isAuthenticated) {
      uni.navigateTo({
        url: '/pages/Admin/Admin'
      });
      return;
    }
  },
  methods: {
    // Validate form
    validateForm() {
      let isValid = true;
      this.errors = {
        username: '',
        password: ''
      };
      
      // Validate username
      if (!this.formData.username.trim()) {
        this.errors.username = '请输入用户名';
        isValid = false;
      }
      
      // Validate password
      if (!this.formData.password) {
        this.errors.password = '请输入密码';
        isValid = false;
      }
      
      return isValid;
    },
    
    // Handle form submit
    async handleSubmit() {
      if (this.loading) return;
      
      if (!this.validateForm()) {
        return;
      }
      
      this.loading = true;
      
      try {
        const adminStore = useAdminStore();
        
        const response = await adminStore.login({
          username: this.formData.username,
          password: this.formData.password
        });
        
        // 直接从响应中尝试提取数据
        const responseData = response.data;
        
        // 确保管理员数据已保存
        if (responseData && responseData.code === 200 && responseData.data) {
          const adminData = responseData.data;
          
          // 直接设置管理员数据
          if (adminData.token && adminData.role) {
            adminStore.setAdmin(adminData);
          }
        }
        
        // 如果仍然没有认证，尝试直接设置响应中的数据
        if (!adminStore.isAuthenticated && responseData && responseData.data) {
          const directData = responseData.data;
          adminStore.adminToken = directData.token;
          adminStore.role = directData.role;
          
          // 保存到本地存储
          uni.setStorageSync('admin_token', directData.token);
          uni.setStorageSync('admin_role', directData.role);
        }
        
        // Show success message
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        
        // Navigate based on role
        setTimeout(() => {
          // 确定跳转路径
          let redirectPath = '/pages/Admin/Admin';
          
          if (adminStore.isAdmin || (responseData?.data?.role === 'admin')) {
            // 管理员页面
            redirectPath = '/pages/Admin/Admin';
          } else if (adminStore.isAuditor || (responseData?.data?.role === 'auditor')) {
            // 审核员页面
            redirectPath = '/pages/Admin/Admin?role=auditor';
          }
          
          uni.redirectTo({
            url: redirectPath,
            success: () => console.log('跳转成功'),
            fail: (err) => console.error('跳转失败:', err)
          });
        }, 1500);
      } catch (error) {
        console.error('Login error:', error);
        
        uni.showToast({
          title: '用户名或密码错误',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // Toggle password visibility
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    // Navigate to home page
    goToHome() {
      uni.switchTab({
        url: '/pages/Home/Home'
      });
    }
  }
}
</script>

<style>
.container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #13547a 0%, #80d0c7 100%);
  font-family: 'Poppins', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 460px;
  max-width: 90%;
  padding: 40px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #13547a;
}

.form-item {
  margin-bottom: 20px;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 12px;
  padding: 0 15px;
  height: 50px;
  transition: all 0.3s;
}

.input-container:focus-within {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  background-color: #fff;
}

.input-container.error {
  border: 1px solid #ff4d4f;
}

.input-icon {
  color: #999;
  font-size: 18px;
  margin-right: 10px;
}

.input {
  flex: 1;
  height: 50px;
  font-size: 16px;
  color: #333;
}

.toggle-password {
  color: #999;
  padding: 10px;
  font-size: 18px;
}

.error-tip {
  font-size: 12px;
  color: #ff4d4f;
  padding: 5px 0 0 10px;
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #13547a 0%, #23a2f6 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
  box-shadow: 0 8px 20px rgba(19, 84, 122, 0.3);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.login-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(19, 84, 122, 0.5);
}

.login-button.loading {
  opacity: 0.8;
}

.home-link {
  text-align: center;
}

.link {
  font-size: 14px;
  color: #3B82F6;
  font-weight: 600;
  cursor: pointer;
}

/* PC端适配 */
@media screen and (min-width: 992px) {
  .login-card {
    width: 460px;
  }
}
</style> 