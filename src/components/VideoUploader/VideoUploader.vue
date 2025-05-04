<template>
  <view class="video-uploader">
    <view class="video-container" v-if="videoUrl">
      <video 
        class="video-player" 
        :src="videoUrl" 
        controls
      ></video>
      <view class="delete-button" @click="deleteVideo">
        <text class="delete-icon"><i class="fas fa-trash"></i></text>
      </view>
    </view>
    
    <view 
      class="upload-button" 
      v-if="!videoUrl"
      @click="chooseVideo"
    >
      <text class="upload-icon"><i class="fas fa-video"></i></text>
      <text class="upload-text">上传视频</text>
      <text class="upload-tip">(可选，最大100MB)</text>
    </view>
    
    <view class="progress-container" v-if="uploading">
      <progress 
        class="progress-bar" 
        :percent="uploadProgress" 
        show-info 
        stroke-width="3"
      />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 100 * 1024 * 1024 // 100MB
    }
  },
  data() {
    return {
      videoUrl: '',
      uploading: false,
      uploadProgress: 0
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.videoUrl = newVal;
      },
      immediate: true
    }
  },
  methods: {
    // 选择视频
    chooseVideo() {
      if (this.uploading) {
        uni.showToast({
          title: '正在上传中，请稍候',
          icon: 'none'
        });
        return;
      }
      
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          console.log('Chosen video:', res);
          
          // 检查视频大小
          if (res.size > this.maxSize) {
            uni.showToast({
              title: `视频大小不能超过${this.formatSize(this.maxSize)}`,
              icon: 'none'
            });
            return;
          }
          
          // 临时显示本地视频
          this.videoUrl = res.tempFilePath;
          
          // 上传视频
          this.uploadVideo(res.tempFilePath);
        }
      });
    },
    
    // 上传视频到服务器
    uploadVideo(filePath) {
      this.uploading = true;
      this.uploadProgress = 0;
      
      const uploadTask = uni.uploadFile({
        url: 'https://api-example.com/api/upload/video', // 替换为实际的上传API
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(res.data);
              this.videoUrl = result.url;
              this.$emit('input', result.url);
              
              uni.showToast({
                title: '视频上传成功',
                icon: 'success'
              });
            } catch (e) {
              console.error('解析上传响应失败:', e);
              this.handleUploadError('解析响应失败');
            }
          } else {
            this.handleUploadError(`上传失败，状态码: ${res.statusCode}`);
          }
        },
        fail: (err) => {
          console.error('Upload failed:', err);
          this.handleUploadError('网络错误');
        },
        complete: () => {
          this.uploading = false;
          this.uploadProgress = 100;
        }
      });
      
      // 监听上传进度
      uploadTask.onProgressUpdate((res) => {
        this.uploadProgress = res.progress;
      });
    },
    
    // 处理上传错误
    handleUploadError(message) {
      this.videoUrl = '';
      this.$emit('input', '');
      
      uni.showToast({
        title: `视频上传失败: ${message}`,
        icon: 'none'
      });
    },
    
    // 删除视频
    deleteVideo() {
      uni.showModal({
        title: '提示',
        content: '确定要删除这个视频吗？',
        success: (res) => {
          if (res.confirm) {
            this.videoUrl = '';
            this.$emit('input', '');
          }
        }
      });
    },
    
    // 格式化文件大小
    formatSize(bytes) {
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
}
</script>

<style>
.video-uploader {
  padding: 20rpx 0;
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.video-player {
  width: 100%;
  height: 400rpx;
}

.delete-button {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  color: white;
  font-size: 30rpx;
}

.upload-button {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 50rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #666;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.progress-container {
  margin-top: 20rpx;
}

.progress-bar {
  width: 100%;
}
</style> 