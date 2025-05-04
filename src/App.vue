<script>
import { useUserStore, useAdminStore, useDiaryStore } from '@/store';
import { requiresUserAuth, requiresAdminAuth } from '@/utils/routerHelper';

export default {
  onLaunch: function () {
    console.log('App Launch');
    
    // 初始化 stores，从持久化存储加载数据
    // 注意：必须在组件环境中调用这些 use* 函数
    this.initStores();
    
    // 监听 H5 路由变化
    this.setupH5RouteListener();
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  },
  methods: {
    // 初始化所有 stores
    initStores() {
      // 这些 store 的状态已在各自的 state 中通过 getStorageSync 初始化
      const userStore = useUserStore();
      const adminStore = useAdminStore();
      const diaryStore = useDiaryStore();
      
      console.log('Stores initialized from persistent storage');
    },
    
    // 设置 H5 路由监听
    setupH5RouteListener() {
      // #ifdef H5
      // 监听 H5 平台的 popstate 事件（浏览器前进、后退按钮）
      window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname;
        
        // 检查是否需要管理员登录
        if (requiresAdminAuth(currentPath)) {
          const adminToken = uni.getStorageSync('admin_token');
          if (!adminToken) {
            uni.redirectTo({
              url: '/pages/AdminLogin/AdminLogin'
            });
          }
        }
        
        // 检查是否需要用户登录
        if (requiresUserAuth(currentPath)) {
          const userToken = uni.getStorageSync('user_token');
          if (!userToken) {
            uni.redirectTo({
              url: '/pages/Login/Login'
            });
          }
        }
      });
      // #endif
    }
  }
}
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni.scss';

/* 页面动画样式 */
/* 淡入 */
.uni-fade-in-enter-active {
  transition: opacity 0.3s;
}
.uni-fade-in-enter {
  opacity: 0;
}

/* 淡出 */
.uni-fade-out-leave-active {
  transition: opacity 0.3s;
}
.uni-fade-out-leave-to {
  opacity: 0;
}

/* 淡入淡出 */
.uni-fade-in-out-enter-active,
.uni-fade-in-out-leave-active {
  transition: opacity 0.3s;
}
.uni-fade-in-out-enter,
.uni-fade-in-out-leave-to {
  opacity: 0;
}

/* 全局样式设置 */
page {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', Arial, sans-serif;
  color: #333;
  line-height: 1.5;
  background-color: #f6f9fc;
}

/* 内容容器 */
.container {
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

/* 全局按钮样式 */
button {
  transition: all 0.3s;
}

button:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
