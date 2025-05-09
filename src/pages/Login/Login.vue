<template>
  <view class="container">
    <view class="login-card">
      <!-- Logo and Title -->
      <view class="logo-container">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="app-name">Travel Diary</text>
      </view>
      
      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Username Input -->
        <view class="form-item">
          <view class="input-container">
            <text class="input-icon"><i class="fas fa-user"></i></text>
            <input 
              type="text" 
              v-model="formData.username" 
              class="input" 
              placeholder="邮箱或手机号" 
              :disabled="loading"
            />
          </view>
          <text class="error-tip" v-if="errors.username">{{ errors.username }}</text>
        </view>
        
        <!-- Password Input -->
        <view class="form-item">
          <view class="input-container">
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
        
        <!-- Remember Me -->
        <view class="remember-container">
          <view class="checkbox-container" @click="toggleRemember">
            <view :class="['checkbox', { 'checked': remember }]">
              <text v-if="remember" class="check-icon"><i class="fas fa-check"></i></text>
            </view>
            <text class="remember-text">记住账号</text>
          </view>
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
        
        <!-- Register Link -->
        <view class="register-link">
          <text class="link-text">没有账号？</text>
          <text class="link" @click="goToRegister">立即注册</text>
        </view>
      </form>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user.js';

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
      showPassword: false,
      remember: false,
      loginKey: 'remembered_username'
    }
  },
  onLoad(options) {
    // Check if already logged in
    const userStore = useUserStore();
    if (userStore.isAuthenticated) {
      uni.switchTab({
        url: '/pages/Home/Home'
      });
      return;
    }
    
    // Load remembered username
    this.loadRememberedUsername();
    
    // 如果URL中包含username参数，则设置到表单中
    if (options.username) {
      this.formData.username = decodeURIComponent(options.username);
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
      
      // 静态账号密码测试 (仅用于演示)
      const staticAccounts = [
        { username: 'test@example.com', password: '123456' },
        { username: '13800138000', password: '123456' }
      ];
      
      // 检查是否匹配静态账号
      const matchedAccount = staticAccounts.find(
        account => account.username === this.formData.username && account.password === this.formData.password
      );
      
      if (matchedAccount) {
        // 模拟登录成功
        const userStore = useUserStore();
        
        // 手动设置用户数据 - 使用更新后的方法名 setUser 替代 setUserData
        userStore.setUser({
          token: 'demo-token-12345',
          user: {
            id: 1,
            username: matchedAccount.username,
            nickname: '测试用户',
            avatar: '/static/default-avatar.png'
          }
        });
        
        // 保存记住的用户名
        if (this.remember) {
          this.saveUsername();
        } else {
          this.clearRememberedUsername();
        }
        
        // 显示成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        
        // 导航到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/Home/Home'
          });
        }, 1500);
        
        this.loading = false;
        return;
      }
      
      // 如果静态账号不匹配，可以尝试调用API (如果后端可用)
      try {
        const userStore = useUserStore();
        console.log('调用 userStore.login 前');
        await userStore.login({
          username: this.formData.username,
          password: this.formData.password
        });
        console.log('调用 userStore.login 后');
        
        // Save username if remember is checked
        if (this.remember) {
          this.saveUsername();
        } else {
          this.clearRememberedUsername();
        }
        
        // Show success message
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });
        
        // Navigate to home page
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/Home/Home'
          });
        }, 1500);
      } catch (error) {
        console.error('Login error:', error);
        
        // 对于静态演示，显示用户名或密码错误
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
    
    // Toggle remember me
    toggleRemember() {
      this.remember = !this.remember;
    },
    
    // Save username to local storage
    saveUsername() {
      try {
        uni.setStorageSync(this.loginKey, this.formData.username);
      } catch (e) {
        console.error('Failed to save username:', e);
      }
    },
    
    // Load remembered username
    loadRememberedUsername() {
      try {
        const username = uni.getStorageSync(this.loginKey);
        if (username) {
          this.formData.username = username;
          this.remember = true;
        }
      } catch (e) {
        console.error('Failed to load username:', e);
      }
    },
    
    // Clear remembered username
    clearRememberedUsername() {
      try {
        uni.removeStorageSync(this.loginKey);
      } catch (e) {
        console.error('Failed to clear username:', e);
      }
    },
    
    // Navigate to register page
    goToRegister() {
      uni.navigateTo({
        url: '/pages/Register/Register',
        animationType: 'slide-in-right',
        animationDuration: 300
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
  width: 85%;
  padding: 50rpx 40rpx;
  background-color: white;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10rpx);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.logo {
  width: 150rpx;
  height: 150rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #13547a;
}

.form-item {
  margin-bottom: 30rpx;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 24rpx;
  padding: 0 30rpx;
  height: 100rpx;
  transition: all 0.3s;
}

.input-container:focus-within {
  box-shadow: 0 0 15rpx rgba(59, 130, 246, 0.5);
  background-color: #fff;
}

.input-icon {
  color: #999;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.input {
  flex: 1;
  height: 100rpx;
  font-size: 30rpx;
  color: #333;
}

.toggle-password {
  color: #999;
  padding: 20rpx;
  font-size: 36rpx;
}

.error-tip {
  font-size: 24rpx;
  color: #ff4d4f;
  padding: 10rpx 0 0 20rpx;
}

.remember-container {
  display: flex;
  margin-bottom: 40rpx;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 2rpx solid #ddd;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.check-icon {
  color: white;
  font-size: 24rpx;
}

.remember-text {
  font-size: 28rpx;
  color: #666;
}

.login-button {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #13547a 0%, #23a2f6 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 20rpx rgba(19, 84, 122, 0.3);
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.login-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 30rpx rgba(19, 84, 122, 0.5);
}

.login-button.loading {
  opacity: 0.8;
}

.register-link {
  text-align: center;
}

.link-text {
  font-size: 28rpx;
  color: #666;
}

.link {
  font-size: 28rpx;
  color: #3B82F6;
  font-weight: 600;
  margin-left: 10rpx;
  cursor: pointer;
}
</style> 