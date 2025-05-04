// Stores
import { useUserStore } from './user';
import { useAdminStore } from './admin';
import { useDiaryStore } from './diary';

/**
 * 初始化所有 stores 的持久化数据
 * 在应用启动时调用
 */
export function initializeStores() {
  // 注意：必须在组件或页面中调用这些 use* 函数
  // 这里仅为示例，实际应该在 App.vue 的 onLaunch 中调用
}

// 导出所有 stores 便于引用
export {
  useUserStore,
  useAdminStore,
  useDiaryStore
}; 