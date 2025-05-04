<template>
  <view class="container">
    <view class="form-container">
      <form @submit.prevent="submitForm">
        <!-- 标题 -->
        <view class="form-item">
          <view class="form-label required">游记标题</view>
          <view class="input-container">
            <text class="input-icon"><i class="fas fa-heading"></i></text>
            <input 
              class="form-input"
              v-model="formData.title" 
              placeholder="请输入标题（最多50字）" 
              maxlength="50"
              @input="checkDraft"
            />
          </view>
          <view class="error-tip" v-if="errors.title">{{ errors.title }}</view>
        </view>
        
        <!-- 内容 -->
        <view class="form-item">
          <view class="form-label required">游记内容</view>
          <view class="input-container mb-10">
            <text class="input-icon"><i class="fas fa-file-alt"></i></text>
            <text class="content-label">请输入内容</text>
          </view>
          <textarea
            class="content-textarea"
            v-model="formData.content"
            placeholder="分享你的旅行故事..."
            @input="checkDraft"
            maxlength="-1"
            auto-height
          />
          <view class="error-tip" v-if="errors.content">{{ errors.content }}</view>
        </view>
        
        <!-- 图片上传 -->
        <view class="form-item">
          <view class="form-label required">上传图片</view>
          <image-uploader 
            v-model="formData.images" 
            :max-count="9"
            :required="true"
            ref="imageUploader"
          />
          <view class="error-tip" v-if="errors.images">{{ errors.images }}</view>
        </view>
        
        <!-- 视频上传 -->
        <view class="form-item">
          <view class="form-label">上传视频（可选）</view>
          <video-uploader 
            v-model="formData.video"
            ref="videoUploader"
          />
        </view>
        
        <!-- 提交按钮 -->
        <view class="submit-button" @click="submitForm">
          <text class="submit-text">{{ isEdit ? '保存修改' : '发布游记' }}</text>
        </view>
      </form>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user.js';
import ImageUploader from '@/components/ImageUploader/ImageUploader.vue';
import VideoUploader from '@/components/VideoUploader/VideoUploader.vue';
import api from '@/services/api.js';

export default {
  components: {
    ImageUploader,
    VideoUploader
  },
  data() {
    return {
      formData: {
        title: '',
        content: '',
        images: [],
        video: ''
      },
      errors: {
        title: '',
        content: '',
        images: ''
      },
      isEdit: false,
      diaryId: null,
      hasDraft: false,
      draftKey: 'diary_draft',
      isSubmitting: false
    }
  },
  computed: {
    userStore() {
      return useUserStore();
    }
  },
  onLoad(options) {
    // 检查用户是否登录
    if (!this.userStore.token) {
      uni.redirectTo({
        url: '/pages/Login/Login'
      });
      return;
    }
    
    // 判断是新建还是编辑
    if (options.id) {
      this.isEdit = true;
      this.diaryId = options.id;
      this.fetchDiaryData(options.id);
    } else {
      // 尝试加载草稿
      this.loadDraft();
    }
  },
  onUnload() {
    // 页面退出时提示保存草稿
    if (!this.isEdit && !this.isSubmitting && this.hasFormData()) {
      this.saveDraftConfirm();
    }
  },
  methods: {
    // 获取游记数据
    async fetchDiaryData(id) {
      uni.showLoading({
        title: '加载中...'
      });
      
      try {
        const response = await api.diaries.getById(id);
        const diary = response.data;
        
        this.formData = {
          title: diary.title || '',
          content: diary.content || '',
          images: diary.images || [],
          video: diary.video || ''
        };
      } catch (error) {
        uni.showToast({
          title: '获取游记数据失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 验证表单
    validateForm() {
      // 重置错误信息
      this.errors = {
        title: '',
        content: '',
        images: ''
      };
      
      let isValid = true;
      
      // 验证标题
      if (!this.formData.title.trim()) {
        this.errors.title = '请输入游记标题';
        isValid = false;
      } else if (this.formData.title.length > 50) {
        this.errors.title = '标题最多50个字符';
        isValid = false;
      }
      
      // 验证内容
      if (!this.formData.content.trim()) {
        this.errors.content = '请输入游记内容';
        isValid = false;
      }
      
      // 验证图片
      if (!this.$refs.imageUploader.validate()) {
        this.errors.images = '请上传至少一张图片';
        isValid = false;
      }
      
      return isValid;
    },
    
    // 提交表单
    submitForm() {
      if (this.isSubmitting) return;
      
      if (this.validateForm()) {
        this.submitDiary();
      }
    },
    
    // 提交游记数据到服务器
    async submitDiary() {
      uni.showLoading({
        title: '提交中...'
      });
      
      this.isSubmitting = true;
      
      try {
        const data = {
          title: this.formData.title,
          content: this.formData.content,
          images: this.formData.images,
          video: this.formData.video
        };
        
        let response;
        
        if (this.isEdit) {
          // 编辑已有游记
          response = await api.diaries.update(this.diaryId, data);
        } else {
          // 新建游记
          response = await api.diaries.create(data);
        }
        
        // 成功后清除草稿
        this.clearDraft();
        
        uni.showToast({
          title: this.isEdit ? '更新成功' : '发布成功',
          icon: 'success'
        });
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/MyDiaries/MyDiaries'
          });
        }, 1500);
      } catch (error) {
        const message = error.response?.data?.message || '网络错误，请重试';
        
        uni.showToast({
          title: message,
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
        this.isSubmitting = false;
      }
    },
    
    // 检查是否有表单数据
    hasFormData() {
      return this.formData.title.trim() !== '' || 
        this.formData.content.trim() !== '' || 
        this.formData.images.length > 0 || 
        this.formData.video !== '';
    },
    
    // 检查是否需要保存草稿
    checkDraft() {
      if (this.isEdit) return;
      
      this.hasDraft = this.hasFormData();
    },
    
    // 保存草稿
    saveDraft() {
      try {
        uni.setStorageSync(this.draftKey, JSON.stringify(this.formData));
        this.hasDraft = true;
      } catch (e) {
        console.error('保存草稿失败:', e);
      }
    },
    
    // 加载草稿
    loadDraft() {
      try {
        const draft = uni.getStorageSync(this.draftKey);
        if (draft) {
          const draftData = JSON.parse(draft);
          
          uni.showModal({
            title: '发现草稿',
            content: '是否恢复之前未完成的游记？',
            success: (res) => {
              if (res.confirm) {
                this.formData = draftData;
                this.hasDraft = true;
              } else {
                this.clearDraft();
              }
            }
          });
        }
      } catch (e) {
        console.error('加载草稿失败:', e);
      }
    },
    
    // 清除草稿
    clearDraft() {
      try {
        uni.removeStorageSync(this.draftKey);
        this.hasDraft = false;
      } catch (e) {
        console.error('清除草稿失败:', e);
      }
    },
    
    // 离开页面前提示保存草稿
    saveDraftConfirm() {
      uni.showModal({
        title: '保存草稿',
        content: '是否保存当前内容为草稿？',
        success: (res) => {
          if (res.confirm) {
            this.saveDraft();
            uni.showToast({
              title: '草稿已保存',
              icon: 'success'
            });
          } else {
            this.clearDraft();
          }
        }
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
}

.form-container {
  margin: 30rpx;
  padding: 40rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 15rpx;
  display: block;
}

.required:after {
  content: '*';
  color: #ff4d4f;
  margin-left: 5rpx;
}

.form-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #333;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  height: 80rpx;
}

.input-icon {
  color: #999;
  margin-right: 20rpx;
  font-size: 30rpx;
}

.content-label {
  font-size: 28rpx;
  color: #666;
}

.mb-10 {
  margin-bottom: 10rpx;
}

.content-textarea {
  width: 100%;
  min-height: 300rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
  border: none;
}

.error-tip {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-top: 8rpx;
}

.submit-button {
  margin-top: 40rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #80d0c7 0%, #a3e4d7 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.submit-button:active {
  transform: scale(1.05);
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.3);
}

.submit-text {
  color: white;
  font-size: 32rpx;
  font-weight: 600;
}
</style> 