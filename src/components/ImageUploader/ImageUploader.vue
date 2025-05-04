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
    async imageToDataURL(filePath) {
      return new Promise((resolve, reject) => {
        // 读取本地文件为Base64
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
          
          // 使用DataURL上传
          const uploadResult = await this.uploadFile(dataURL);
          
          // 上传成功，更新状态和URL
          if (index !== -1) {
            this.imageList[index].status = 'success';
            this.imageList[index].url = uploadResult.url;
            
            // 通知父组件值已更改
            this.emitChange();
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
    
    // 上传单个文件
    uploadFile(dataURL) {
      return new Promise((resolve, reject) => {
        uni.request({
          url: 'https://api-example.com/api/upload/image', // 替换为实际的上传API
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          },
          data: {
            image: dataURL  // 直接发送dataURL
          },
          success: (res) => {
            if (res.statusCode === 200) {
              try {
                resolve(res.data);
              } catch (e) {
                reject(new Error('解析上传响应失败'));
              }
            } else {
              reject(new Error(`上传失败，状态码: ${res.statusCode}`));
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
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