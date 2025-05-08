import axios from 'axios';

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
    uni.uploadFile({
      url,
      filePath, // 这里是本地临时路径
      name: 'file',
      header: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      fail: reject
    });
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
