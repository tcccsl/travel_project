// 封装所有与用户相关的接口函数
import http from '@/utils/http';

// 登录接口
export const loginApi = (account, password) => {
  return http.post('/login', {
    account,
    password
  });
};