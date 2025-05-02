import http from '@/utils/http';

// 登录
export const login = (data) => {
  return http.post('/login', data);
};

// 注册
export const register = (data) => {
  return http.post('/register', data);
};

// 检查昵称是否存在
export const checkNickname = (nickname) => {
  return http.post('/user/check-nickname', { nickname });
};

// 上传头像
export const uploadAvatar = (formData) => {
  return http.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}; 