<template>
  <view class="image-uploader">
    <view class="image-list">
      <view 
        class="image-item" 
        v-for="(image, index) in imageList" 
        :key="index"
      >
        <image 
          class="preview-image" 
          :src="image.url" 
          mode="aspectFill"
          @click="previewImage(index)"
        ></image>
        <view class="delete-icon" @click.stop="deleteImage(index)">
          <text class="delete-text"><i class="fas fa-times"></i></text>
        </view>
      </view>
      
      <view 
        class="upload-button" 
        v-if="imageList.length < maxCount"
        @click="chooseImage"
      >
        <text class="upload-icon"><i class="fas fa-plus"></i></text>
        <text class="upload-text">添加图片</text>
      </view>
    </view>
    
    <view class="tip-text" v-if="required">
      <text>* 请至少上传一张图片</text>
    </view>
  </view>
</template>

<script>
import api from '@/services/api';  // 导入API服务

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    maxCount: {
      type: Number,
      default: 9
    },
    required: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 默认最大10MB
    }
  },
  data() {
    return {
      imageList: [],
      uploading: false
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // 如果外部传入的值变化，则更新本地的imageList
        if (newVal && Array.isArray(newVal)) {
          this.imageList = newVal.map(url => ({
            url,
            status: 'success'
          }));
        }
      },
      immediate: true
    }
  },
  methods: {
    // 选择图片
    chooseImage() {
      if (this.uploading) {
        uni.showToast({
          title: '正在上传中，请稍候',
          icon: 'none'
        });
        return;
      }
      
      const count = this.maxCount - this.imageList.length;
      if (count <= 0) return;
      
      uni.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFiles = res.tempFiles;
          
          // 检查图片大小
          const oversizedFiles = tempFiles.filter(file => file.size > this.maxSize);
          if (oversizedFiles.length > 0) {
            uni.showToast({
              title: `图片大小不能超过${this.formatSize(this.maxSize)}`,
              icon: 'none'
            });
            return;
          }
          
          // 添加到列表中，初始状态为uploading
          const newImages = tempFiles.map(file => ({
            url: file.path,
            status: 'uploading',
            file
          }));
          
          this.imageList = [...this.imageList, ...newImages];
          
          // 上传图片
          this.uploadImages(newImages);
        }
      });
    },
    
    // 将图片转换为Base64或DataURL
    imageToDataURL(filePath) {
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
        // 对于H5环境，uni.chooseImage会返回本地临时路径，可能是blob:开头的URL
        if (filePath.startsWith('blob:') || filePath.startsWith('http')) {
          // 如果是blob URL或已经是网络图片，直接使用fetch获取
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
            // 根据文件类型构造完整的data URL
            const fileType = filePath.match(/\.([^\.]+)$/);
            let mimeType = 'image/jpeg'; // 默认mime类型
            if (fileType) {
              const ext = fileType[1].toLowerCase();
              if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';
            }
            resolve(`data:${mimeType};base64,${res.data}`);
          },
          fail: (err) => {
            reject(err);
          }
        });
        // #endif
      });
    },
    
    // 上传图片到服务器
    async uploadImages(images) {
      this.uploading = true;
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const index = this.imageList.findIndex(item => item === image);
        
        try {
          // 先将图片转换为DataURL
          const dataURL = await this.imageToDataURL(image.file.path);
          
          // 打印完整的dataURL开头部分和长度，不要截断
          console.log('图片转换为dataURL结果前200字符:', dataURL.substring(0, 200));
          console.log('图片dataURL总长度:', dataURL.length);
          
          // 在上传前先尝试显示dataURL图片验证是否有效
          this.testImageDataURL(dataURL);
          
          // 关键修改：直接使用dataURL，不再依赖服务器返回的URL
          if (index !== -1) {
            this.imageList[index].status = 'success';
            // 直接使用本地生成的dataURL作为图片源
            this.imageList[index].url = dataURL;
            
            // 通知父组件值已更改
            this.emitChange();
            
            // 创建一个新标签页打开图片URL进行测试
            this.openImageInNewTab(dataURL);
            
            // 仍然上传到服务器，但不使用返回的URL
            try {
              const uploadResult = await this.uploadFile(dataURL);
              console.log('服务器返回的URL:', uploadResult.url);
              console.log('我们使用的本地dataURL:', dataURL.substring(0, 100) + '...');
            } catch (uploadError) {
              console.error('上传到服务器失败，但本地显示仍然有效', uploadError);
            }
          }
        } catch (error) {
          console.error('Upload failed:', error);
          
          // 上传失败，更新状态
          if (index !== -1) {
            this.imageList[index].status = 'fail';
          }
          
          uni.showToast({
            title: '图片上传失败，请重试',
            icon: 'none'
          });
        }
      }
      
      this.uploading = false;
    },
    
    // 测试dataURL图片是否有效
    testImageDataURL(dataURL) {
      const img = new Image();
      img.onload = () => {
        console.log('图片dataURL有效! 尺寸:', img.width, 'x', img.height);
      };
      img.onerror = () => {
        console.error('图片dataURL无效或损坏!');
      };
      img.src = dataURL;
    },
    
    // 在新标签页中打开图片
    openImageInNewTab(dataURL) {
      try {
        // 尝试在新标签页中打开图片
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(`
            <html>
              <head><title>图片预览</title></head>
              <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
                <div style="max-width: 100%; text-align: center;">
                  <p style="margin-bottom: 20px;">测试图片URL (Base64 DataURL):</p>
                  <img src="${dataURL}" style="max-width: 100%; max-height: 80vh; box-shadow: 0 0 10px rgba(0,0,0,0.1);" />
                  <p style="margin-top: 20px;">如果图片正常显示，说明dataURL有效。如果不显示，说明dataURL可能有问题。</p>
                </div>
              </body>
            </html>
          `);
          w.document.close();
        }
      } catch (e) {
        console.error('无法在新标签页打开图片:', e);
      }
    },
    
    // 上传单个文件
    uploadFile(dataURL) {
      return new Promise((resolve, reject) => {
        // 使用API服务上传图片
        api.upload.image(dataURL)
          .then(response => {
            // 打印上传成功后的URL地址
            console.log('图片上传成功，URL地址:', response.data.url);
            
            // 尝试发起一个请求来验证服务器返回的URL是否可访问
            this.checkImageUrlAccess(response.data.url);
            
            resolve(response.data);
          })
          .catch(error => {
            console.error('Upload failed:', error);
            reject(error);
          });
      });
    },
    
    // 检查图片URL是否可以访问
    checkImageUrlAccess(url) {
      try {
        const img = new Image();
        img.onload = () => console.log('服务器返回的图片URL可以访问:', url);
        img.onerror = () => console.error('服务器返回的图片URL无法访问:', url);
        img.src = url;
      } catch (e) {
        console.error('检查图片URL时出错:', e);
      }
    },
    
    // 预览图片
    previewImage(index) {
      const urls = this.imageList.map(item => item.url);
      uni.previewImage({
        current: index,
        urls
      });
    },
    
    // 删除图片
    deleteImage(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.imageList.splice(index, 1);
            this.emitChange();
          }
        }
      });
    },
    
    // 获取所有成功上传的图片URL
    getImageUrls() {
      return this.imageList
        .filter(image => image.status === 'success')
        .map(image => image.url);
    },
    
    // 通知父组件值已更改
    emitChange() {
      const urls = this.getImageUrls();
      this.$emit('input', urls);
    },
    
    // 验证是否满足要求
    validate() {
      if (this.required && this.getImageUrls().length === 0) {
        return false;
      }
      return true;
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
.image-uploader {
  padding: 20rpx 0;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 210rpx;
  height: 210rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-icon {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-text {
  color: white;
  font-size: 24rpx;
}

.upload-button {
  width: 210rpx;
  height: 210rpx;
  background-color: #f5f5f5;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 40rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.tip-text {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-top: 10rpx;
}
</style> 