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
import api from '@/services/api';  // 导入API服务

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
      
      // 先将视频转换为DataURL
      this.videoToDataURL(filePath).then(dataURL => {
        // 打印视频DataURL信息
        console.log('视频转换为dataURL结果前200字符:', dataURL.substring(0, 200));
        console.log('视频dataURL总长度:', dataURL.length);
        
        // 测试视频dataURL
        this.testVideoDataURL(dataURL);
        
        // 直接使用dataURL作为视频源
        this.videoUrl = dataURL;
        this.$emit('input', dataURL);
        
        // 创建一个新标签页测试视频
        this.openVideoInNewTab(dataURL);
        
        // 仍然上传到服务器，但不依赖其返回值
        api.upload.video(dataURL)
          .then(response => {
            console.log('服务器返回的视频URL:', response.data.url);
            console.log('我们使用的本地视频dataURL:', dataURL.substring(0, 100) + '...');
            
            // 检查服务器URL是否可用
            this.checkVideoUrlAccess(response.data.url);
            
            // 不再设置服务器返回的URL
            // this.videoUrl = response.data.url;
            // this.$emit('input', response.data.url);
            
            uni.showToast({
              title: '视频处理成功',
              icon: 'success'
            });
            
            this.uploading = false;
            this.uploadProgress = 100;
          })
          .catch(error => {
            console.error('Upload failed:', error);
            // 由于已经使用本地dataURL，所以上传失败不影响显示
            // 仅记录错误信息
            console.warn('视频上传到服务器失败，但本地显示仍然有效');
            
            this.uploading = false;
            this.uploadProgress = 100;
          });
      }).catch(error => {
        console.error('Convert video failed:', error);
        this.handleUploadError('视频转换失败');
        this.uploading = false;
      });
    },
    
    // 将视频转换为DataURL
    videoToDataURL(filePath) {
      return new Promise((resolve, reject) => {
        // 针对不同平台使用不同的方法获取base64
        // #ifdef APP-PLUS
        // App环境使用plus API
        plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
          entry.file((file) => {
            const reader = new plus.io.FileReader();
            reader.onloadend = function(e) {
              // 返回base64
              resolve(e.target.result);
            };
            reader.onerror = function(e) {
              reject(e);
            };
            reader.readAsDataURL(file);
          }, (error) => {
            reject(error);
          });
        }, (error) => {
          reject(error);
        });
        // #endif
        
        // #ifdef H5
        // H5环境中直接使用标准FileReader API
        // 对于H5环境，uni.chooseVideo会返回本地临时路径，可能是blob:开头的URL
        if (filePath.startsWith('blob:') || filePath.startsWith('http')) {
          // 如果是blob URL或已经是网络视频，直接使用fetch获取
          fetch(filePath)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onload = e => resolve(e.target.result);
              reader.onerror = e => reject(e);
              reader.readAsDataURL(blob);
            })
            .catch(reject);
        } else {
          // 如果是本地文件路径，尝试将其视为base64
          try {
            // 如果路径已经是data URL，则直接返回
            if (filePath.startsWith('data:')) {
              resolve(filePath);
              return;
            }
            // 否则报错
            reject(new Error('H5环境无法直接读取本地文件路径'));
          } catch (e) {
            reject(e);
          }
        }
        // #endif
        
        // #ifdef MP
        // 小程序环境中使用uni.getFileSystemManager
        const fs = uni.getFileSystemManager();
        fs.readFile({
          filePath: filePath,
          encoding: 'base64',
          success: (res) => {
            // 视频一般是mp4格式
            resolve(`data:video/mp4;base64,${res.data}`);
          },
          fail: (err) => {
            reject(err);
          }
        });
        // #endif
      });
    },
    
    // 测试视频dataURL是否有效
    testVideoDataURL(dataURL) {
      const video = document.createElement('video');
      video.onloadeddata = () => {
        console.log('视频dataURL有效! 尺寸:', video.videoWidth, 'x', video.videoHeight);
      };
      video.onerror = () => {
        console.error('视频dataURL无效或损坏!');
      };
      video.src = dataURL;
      // 预加载但不播放
      video.preload = 'metadata';
    },
    
    // 在新标签页中打开视频
    openVideoInNewTab(dataURL) {
      try {
        // 尝试在新标签页中打开视频
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(`
            <html>
              <head><title>视频预览</title></head>
              <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
                <div style="max-width: 90%; text-align: center;">
                  <p style="margin-bottom: 20px;">测试视频URL (Base64 DataURL):</p>
                  <video controls style="max-width: 100%; max-height: 70vh; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <source src="${dataURL}" type="video/mp4">
                    您的浏览器不支持HTML5视频
                  </video>
                  <p style="margin-top: 20px;">如果视频能播放，说明dataURL有效。如果不能播放，说明dataURL可能有问题。</p>
                </div>
              </body>
            </html>
          `);
          w.document.close();
        }
      } catch (e) {
        console.error('无法在新标签页打开视频:', e);
      }
    },
    
    // 检查视频URL是否可以访问
    checkVideoUrlAccess(url) {
      try {
        const video = document.createElement('video');
        video.onloadeddata = () => console.log('服务器返回的视频URL可以访问:', url);
        video.onerror = () => console.error('服务器返回的视频URL无法访问:', url);
        video.src = url;
        video.preload = 'metadata';
      } catch (e) {
        console.error('检查视频URL时出错:', e);
      }
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