import axios from 'axios';

// 确保URL有http前缀
const ensureHttpUrl = (url) => {
  if (!url) return url;
  if (!url.startsWith('http')) {
    return 'http://' + url;
  }
  return url;
};

export function uploadFile({ url, file, filePath, token, onProgress }) {
  // #ifdef H5
  // H5/浏览器端
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    onUploadProgress: onProgress
  }).then(res => res.data);
  // #endif

  // #ifndef H5
  // App/小程序端
  return new Promise((resolve, reject) => {
    console.log('移动端上传文件:', {
      url,
      filePath,
      hasToken: !!token
    });
    
    // 确保必要参数存在
    if (!url) {
      console.error('上传错误: URL为空');
      uni.showToast({
        title: '上传失败: URL为空',
        icon: 'none',
        duration: 3000
      });
      reject(new Error('URL为空'));
      return;
    }
    
    if (!filePath) {
      console.error('上传错误: 文件路径为空');
      uni.showToast({
        title: '上传失败: 未找到文件',
        icon: 'none',
        duration: 3000
      });
      reject(new Error('文件路径为空'));
      return;
    }
    
    // 确保URL正确
    const fullUrl = ensureHttpUrl(url);
    console.log('使用完整URL:', fullUrl);
    
    // 添加超时处理
    let uploadTimeout = null;
    const UPLOAD_TIMEOUT = 60000; // 60秒
    
    // 在Android平台上添加更详细的日志
    if (uni.getSystemInfoSync().platform === 'android') {
      console.log('Android平台上传文件:', {
        url: fullUrl,
        filePath,
        hasToken: !!token
      });
    }
    
    // 创建取消任务的方法
    let uploadTask = null;
    
    // 设置超时定时器
    uploadTimeout = setTimeout(() => {
      console.warn('上传超时，取消任务');
      if (uploadTask && uploadTask.abort) {
        uploadTask.abort();
      }
      uni.showToast({
        title: '上传超时，请检查网络',
        icon: 'none',
        duration: 3000
      });
      reject(new Error('上传超时'));
    }, UPLOAD_TIMEOUT);
    
    uploadTask = uni.uploadFile({
      url: fullUrl,
      filePath: filePath, // 这里是本地临时路径
      name: 'file',
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      formData: {
        // 添加一些辅助信息
        timestamp: Date.now(),
        platform: 'android'
      },
      success: (res) => {
        // 清除超时定时器
        if (uploadTimeout) clearTimeout(uploadTimeout);
        
        console.log('上传成功，服务器响应:', res);
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据类型:', typeof res.data);
        
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          console.log('解析后的响应数据:', data);
          resolve(data);
        } catch (e) {
          console.error('解析响应数据失败:', e);
          
          // 检查是否返回的是URL字符串
          if (typeof res.data === 'string' && (res.data.includes('http') || res.data.includes('/uploads/'))) {
            // 可能是直接返回的URL
            resolve({
              code: 200,
              msg: '上传成功',
              data: { url: res.data.trim() }
            });
          } else {
            // 尝试直接返回原始数据
            resolve({
              code: 200,
              msg: '上传成功，但服务器响应格式异常',
              data: { url: res.data }
            });
          }
        }
      },
      fail: (err) => {
        // 清除超时定时器
        if (uploadTimeout) clearTimeout(uploadTimeout);
        
        console.error('上传失败:', err);
        
        // 显示更详细的错误信息
        let errorMsg = '上传失败';
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '上传超时，请检查网络';
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '上传失败，请检查网络连接';
          } else if (err.errMsg.includes('abort')) {
            errorMsg = '上传已取消';
          }
        }
        
        // 显示错误信息
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        
        reject(err);
      },
      complete: () => {
        console.log('上传请求完成');
      }
    });
    
    // 添加上传进度回调
    if (onProgress && uploadTask.onProgressUpdate) {
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度:', res.progress + '%', 
          '已发送:', res.totalBytesSent, 
          '总大小:', res.totalBytesExpectedToSend);
          
        onProgress({ 
          loaded: res.totalBytesSent,
          total: res.totalBytesExpectedToSend,
          progress: res.progress / 100
        });
      });
    }
  });
  // #endif
}

/**
 * 自动组装上传参数，适配 H5 和 App/小程序
 * @param {File|string} selected - H5为File对象，App/小程序为临时路径
 * @param {string} token - 用户token
 * @returns {object} - 适配后的参数对象
 */
export function getUploadParams(selected, token) {
  if (process.env.UNI_PLATFORM === 'h5') {
    return { file: selected, token };
  } else {
    return { filePath: selected, token };
  }
}

/**
 * 检测文件是否可用
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} - 文件是否可用
 */
export function checkFileAvailable(filePath) {
  // #ifndef H5
  return new Promise((resolve) => {
    if (!filePath) {
      resolve(false);
      return;
    }
    
    // 检查文件是否存在
    uni.getFileInfo({
      filePath: filePath,
      success: () => {
        resolve(true);
      },
      fail: (err) => {
        console.error('文件检查失败:', err);
        resolve(false);
      }
    });
  });
  // #endif
  
  // #ifdef H5
  return Promise.resolve(!!filePath);
  // #endif
}
