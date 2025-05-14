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
    
    // 初始化网络配置（特别是对Android设备）
    this.initNetworkConfig();
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
    },
    
    // 初始化网络配置
    initNetworkConfig() {
      // #ifdef APP-PLUS
      if (uni.getSystemInfoSync().platform === 'android') {
        console.log('当前是Android设备，正在配置网络安全策略');
        
        // 设置Android网络安全配置
        plus.android.importClass("android.webkit.WebView");
        plus.android.importClass("android.webkit.CookieManager");
        
        try {
          // 开启WebView调试
          if (plus.android.invoke('android.webkit.WebView', 'isDebuggable')) {
            plus.android.invoke('android.webkit.WebView', 'setWebContentsDebuggingEnabled', true);
            console.log('WebView调试已启用');
          }
          
          // 允许明文HTTP请求
          const cookieManager = plus.android.invoke("android.webkit.CookieManager", "getInstance");
          if (cookieManager) {
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(plus.android.currentWebview(), true);
            console.log('Cookie配置完成');
          }
          
          console.log('Android网络配置初始化完成');
        } catch (e) {
          console.error('Android网络配置错误：', e);
        }
      }
      // #endif
      
      // 全局配置网络超时
      uni.setNetworkTimeout({
        request: 60000, // 请求超时时间，60秒
        connectSocket: 60000, // WebSocket连接超时时间
        uploadFile: 60000, // 上传超时时间
        downloadFile: 60000 // 下载超时时间
      });
      
      console.log('网络配置初始化完成');
    }
  }
}
</script>

<style lang="scss">
/*每个页面公共css */
@use '@/uni.scss' as uni;

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
