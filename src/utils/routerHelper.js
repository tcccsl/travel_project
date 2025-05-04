/**
 * 路由辅助函数
 */

// 需要用户登录的页面
export const userAuthPages = ['/my-diaries', '/publish', '/pages/MyDiaries/MyDiaries', '/pages/Publish/Publish'];

// 需要管理员登录的页面
export const adminAuthPages = ['/admin', '/pages/Admin/Admin'];

/**
 * 检查是否需要用户登录
 * @param {string} url - 页面路径
 * @returns {boolean} - 是否需要登录
 */
export function requiresUserAuth(url) {
  return userAuthPages.some(page => url.includes(page));
}

/**
 * 检查是否需要管理员登录
 * @param {string} url - 页面路径
 * @returns {boolean} - 是否需要管理员登录
 */
export function requiresAdminAuth(url) {
  return adminAuthPages.some(page => url.includes(page));
}

/**
 * 处理 H5 直接访问的路由
 * 在应用启动时调用
 */
export function handleH5DirectAccess() {
  // #ifdef H5
  // 获取当前 URL 路径
  const currentPath = window.location.pathname;
  
  // 检查是否直接访问需要管理员登录的页面
  if (requiresAdminAuth(currentPath)) {
    const adminToken = uni.getStorageSync('admin_token');
    if (!adminToken) {
      uni.redirectTo({
        url: '/pages/AdminLogin/AdminLogin'
      });
    }
  }
  
  // 检查是否直接访问需要用户登录的页面
  if (requiresUserAuth(currentPath)) {
    const userToken = uni.getStorageSync('user_token');
    if (!userToken) {
      uni.redirectTo({
        url: '/pages/Login/Login'
      });
    }
  }
  // #endif
} 