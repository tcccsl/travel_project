<template>
  <view class="container">
    <view class="register-card">
      <!-- Header -->
      <view class="header">
        <view class="back-button" @click="goBack">
          <text class="back-icon"><i class="fas fa-arrow-left"></i></text>
        </view>
        <text class="page-title">创建账号</text>
      </view>
      
      <!-- Avatar Upload -->
      <view class="avatar-section">
        <text class="section-title">头像</text>
        <image-uploader 
          v-model="formData.avatars" 
          :max-count="1"
          @input="handleAvatarChange"
          ref="imageUploader"
        />
        <text class="avatar-tip">点击上传头像（可选）</text>
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
              placeholder="邮箱或手机号" 
              @blur="checkUsername"
              :disabled="loading"
            />
          </view>
          <text class="error-tip" v-if="errors.username">{{ errors.username }}</text>
        </view>
        
        <!-- Nickname Input -->
        <view class="form-item">
          <view class="input-container" :class="{ 'error': errors.nickname }">
            <text class="input-icon"><i class="fas fa-id-card"></i></text>
            <input 
              type="text" 
              v-model="formData.nickname" 
              class="input" 
              placeholder="昵称" 
              @blur="checkNickname"
              :disabled="loading"
            />
          </view>
          <text class="error-tip" v-if="errors.nickname">{{ errors.nickname }}</text>
        </view>
        
        <!-- Password Input -->
        <view class="form-item">
          <view class="input-container" :class="{ 'error': errors.password }">
            <text class="input-icon"><i class="fas fa-lock"></i></text>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="formData.password" 
              class="input" 
              placeholder="密码（至少6位字符）" 
              :disabled="loading"
            />
            <text class="toggle-password" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </text>
          </view>
          <text class="error-tip" v-if="errors.password">{{ errors.password }}</text>
        </view>
        
        <!-- Confirm Password Input -->
        <view class="form-item">
          <view class="input-container" :class="{ 'error': errors.confirmPassword }">
            <text class="input-icon"><i class="fas fa-lock"></i></text>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="confirmPassword" 
              class="input" 
              placeholder="确认密码" 
              :disabled="loading"
            />
          </view>
          <text class="error-tip" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</text>
        </view>
        
        <!-- Register Button -->
        <button 
          class="register-button" 
          :class="{ 'loading': loading }" 
          :disabled="loading" 
          @click="handleSubmit"
        >
          {{ loading ? '注册中...' : '注 册' }}
        </button>
        
        <!-- Login Link -->
        <view class="login-link">
          <text class="link-text">已有账号？</text>
          <text class="link" @click="goToLogin">立即登录</text>
        </view>
      </form>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user.js';
import api from '@/services/api.js';
import ImageUploader from '@/components/ImageUploader/ImageUploader.vue';

export default {
  components: {
    ImageUploader
  },
  data() {
    return {
      formData: {
        username: '',
        nickname: '',
        password: '',
        avatar: '',
        avatars: []
      },
      confirmPassword: '',
      errors: {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      showPassword: false,
      isUsernameChecked: false,
      isNicknameChecked: false
    }
  },
  methods: {
    // Toggle password visibility
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    // Handle avatar change
    handleAvatarChange(urls) {
      if (urls && urls.length > 0) {
        this.formData.avatar = urls[0];
      } else {
        this.formData.avatar = '';
      }
    },
    
    // Check if username is unique
    async checkUsername() {
      if (!this.formData.username.trim()) {
        this.errors.username = '请输入用户名';
        this.isUsernameChecked = false;
        return;
      }
      
      // 验证邮箱或手机号格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^1[3-9]\d{9}$/;
      
      if (!emailRegex.test(this.formData.username) && !phoneRegex.test(this.formData.username)) {
        this.errors.username = '请输入有效的邮箱或手机号';
        this.isUsernameChecked = false;
        return;
      }
      
      try {
        // 调用后端接口检查用户名是否可用
        const response = await api.users.checkUsername(this.formData.username);
        this.isUsernameChecked = true;
        this.errors.username = '';
      } catch (error) {
        console.error('Username check failed:', error);
        
        if (error.response?.status === 409) {
          this.errors.username = '该用户名已被使用';
          this.isUsernameChecked = false;
        } else {
          // 网络错误时不显示错误，允许继续注册
          // 后续注册时会再次验证
          this.isUsernameChecked = true;
        }
      }
    },
    
    // Check if nickname is unique
    async checkNickname() {
      if (!this.formData.nickname.trim()) {
        this.errors.nickname = '请输入昵称';
        this.isNicknameChecked = false;
        return;
      }
      
      if (this.formData.nickname.length < 2 || this.formData.nickname.length > 20) {
        this.errors.nickname = '昵称长度应在2-20个字符之间';
        this.isNicknameChecked = false;
        return;
      }
      
      try {
        // 调用后端接口检查昵称是否可用
        const response = await api.users.checkNickname(this.formData.nickname);
        this.isNicknameChecked = true;
        this.errors.nickname = '';
      } catch (error) {
        console.error('Nickname check failed:', error);
        
        if (error.response?.status === 409) {
          this.errors.nickname = '该昵称已被使用';
          this.isNicknameChecked = false;
        } else {
          // 网络错误时不显示错误，允许继续注册
          // 后续注册时会再次验证
          this.isNicknameChecked = true;
        }
      }
    },
    
    // Validate form
    validateForm() {
      let isValid = true;
      this.errors = {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: ''
      };
      
      // 验证用户名
      if (!this.formData.username.trim()) {
        this.errors.username = '请输入用户名';
        isValid = false;
      } else {
        // 验证邮箱或手机号格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^1[3-9]\d{9}$/;
        
        if (!emailRegex.test(this.formData.username) && !phoneRegex.test(this.formData.username)) {
          this.errors.username = '请输入有效的邮箱或手机号';
          isValid = false;
        } else if (!this.isUsernameChecked) {
          this.errors.username = '请先验证用户名是否可用';
          isValid = false;
        }
      }
      
      // 验证昵称
      if (!this.formData.nickname.trim()) {
        this.errors.nickname = '请输入昵称';
        isValid = false;
      } else if (this.formData.nickname.length < 2 || this.formData.nickname.length > 20) {
        this.errors.nickname = '昵称长度应在2-20个字符之间';
        isValid = false;
      } else if (!this.isNicknameChecked) {
        this.errors.nickname = '请先验证昵称是否可用';
        isValid = false;
      }
      
      // 验证密码
      if (!this.formData.password) {
        this.errors.password = '请输入密码';
        isValid = false;
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度至少为6位';
        isValid = false;
      }
      
      // 验证确认密码
      if (!this.confirmPassword) {
        this.errors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (this.confirmPassword !== this.formData.password) {
        this.errors.confirmPassword = '两次输入的密码不一致';
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
      
      // 获取用户存储实例
      const userStore = useUserStore();
      
      try {
        // 注册新用户
        const registerResponse = await api.users.register({
          username: this.formData.username,
          password: this.formData.password,
          nickname: this.formData.nickname,
          avatar: this.formData.avatar || '/static/default-avatar.png'
        });
        
        // 注册成功后自动登录
        await userStore.login({
          username: this.formData.username,
          password: this.formData.password
        });
        
        // 显示成功提示
        uni.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500
        });
        
        // 导航到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/Home/Home'
          });
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
        
        // 处理不同的错误情况
        if (error.response?.status === 409) {
          uni.showToast({
            title: '用户名或昵称已存在',
            icon: 'none'
          });
        } else if (error.message === 'Network Error') {
          uni.showToast({
            title: '请检查网络连接',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: error.response?.data?.message || '注册失败，请重试',
            icon: 'none'
          });
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Navigate to login page
    goToLogin() {
      uni.navigateTo({
        url: '/pages/Login/Login',
        animationType: 'slide-in-left',
        animationDuration: 300
      });
    },
    
    // Go back to previous page (login page)
    goBack() {
      uni.navigateTo({
        url: '/pages/Login/Login',
        animationType: 'slide-in-left',
        animationDuration: 300
      });
    }
  },
  onLoad() {
    // Check if already logged in
    const userStore = useUserStore();
    if (userStore.isAuthenticated) {
      uni.switchTab({
        url: '/pages/Home/Home'
      });
      return;
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

.register-card {
  width: 85%;
  padding: 30rpx 40rpx 50rpx;
  background-color: white;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10rpx);
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  cursor: pointer;
}

.back-icon {
  font-size: 30rpx;
  color: #666;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #13547a;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #13547a;
  margin-bottom: 20rpx;
}

.avatar-tip {
  font-size: 26rpx;
  color: #999;
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
  height: 90rpx;
  transition: all 0.3s;
}

.input-container:focus-within {
  box-shadow: 0 0 15rpx rgba(59, 130, 246, 0.5);
  background-color: #fff;
}

.input-container.error {
  border: 2rpx solid #ff4d4f;
}

.input-icon {
  color: #999;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.input {
  flex: 1;
  height: 90rpx;
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

.register-button {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #80d0c7 0%, #a3e4d7 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 45rpx;
  box-shadow: 0 8rpx 20rpx rgba(128, 208, 199, 0.3);
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.register-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 30rpx rgba(128, 208, 199, 0.5);
}

.register-button.loading {
  opacity: 0.8;
}

.login-link {
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