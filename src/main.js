import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import { userAuthPages, adminAuthPages, handleH5DirectAccess } from "./utils/routerHelper";

// 设置导航守卫
function setupNavigationGuards() {
	// 导航守卫 - 普通页面
	uni.addInterceptor('navigateTo', {
		invoke(args) {
			// 检查是否需要用户登录
			if (userAuthPages.some(page => args.url.includes(page))) {
				const userToken = uni.getStorageSync('user_token');
				if (!userToken) {
					// 用户未登录，跳转到登录页
					uni.navigateTo({
						url: '/pages/Login/Login'
					});
					return false; // 阻止原导航
				}
			}
			
			// 检查是否需要管理员登录
			if (adminAuthPages.some(page => args.url.includes(page))) {
				const adminToken = uni.getStorageSync('admin_token');
				if (!adminToken) {
					// 管理员未登录，跳转到管理员登录页
					uni.navigateTo({
						url: '/pages/AdminLogin/AdminLogin'
					});
					return false; // 阻止原导航
				}
			}
			
			return args; // 继续原导航
		},
		fail(err) {
			console.log('navigateTo 拦截器失败:', err);
			return err;
		}
	});
	
	// 导航守卫 - 重定向页面
	uni.addInterceptor('redirectTo', {
		invoke(args) {
			// 检查是否需要用户登录
			if (userAuthPages.some(page => args.url.includes(page))) {
				const userToken = uni.getStorageSync('user_token');
				if (!userToken) {
					// 用户未登录，跳转到登录页
					uni.redirectTo({
						url: '/pages/Login/Login'
					});
					return false; // 阻止原导航
				}
			}
			
			// 检查是否需要管理员登录
			if (adminAuthPages.some(page => args.url.includes(page))) {
				const adminToken = uni.getStorageSync('admin_token');
				if (!adminToken) {
					// 管理员未登录，跳转到管理员登录页
					uni.redirectTo({
						url: '/pages/AdminLogin/AdminLogin'
					});
					return false; // 阻止原导航
				}
			}
			
			return args; // 继续原导航
		},
		fail(err) {
			console.log('redirectTo 拦截器失败:', err);
			return err;
		}
	});
	
	// 导航守卫 - 切换 Tab
	uni.addInterceptor('switchTab', {
		invoke(args) {
			// 检查是否需要用户登录
			if (userAuthPages.some(page => args.url.includes(page))) {
				const userToken = uni.getStorageSync('user_token');
				if (!userToken) {
					// 用户未登录，跳转到登录页
					uni.navigateTo({
						url: '/pages/Login/Login'
					});
					return false; // 阻止原导航
				}
			}
			
			return args; // 继续原导航
		},
		fail(err) {
			console.log('switchTab 拦截器失败:', err);
			return err;
		}
	});
	
	// 导航守卫 - 重新启动
	uni.addInterceptor('reLaunch', {
		invoke(args) {
			// 检查是否需要用户登录
			if (userAuthPages.some(page => args.url.includes(page))) {
				const userToken = uni.getStorageSync('user_token');
				if (!userToken) {
					// 用户未登录，跳转到登录页
					uni.reLaunch({
						url: '/pages/Login/Login'
					});
					return false; // 阻止原导航
				}
			}
			
			// 检查是否需要管理员登录
			if (adminAuthPages.some(page => args.url.includes(page))) {
				const adminToken = uni.getStorageSync('admin_token');
				if (!adminToken) {
					// 管理员未登录，跳转到管理员登录页
					uni.reLaunch({
						url: '/pages/AdminLogin/AdminLogin'
					});
					return false; // 阻止原导航
				}
			}
			
			return args; // 继续原导航
		},
		fail(err) {
			console.log('reLaunch 拦截器失败:', err);
			return err;
		}
	});
}

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	
	app.use(pinia);
	
	// 设置导航守卫
	setupNavigationGuards();
	
	// 处理 H5 直接访问
	handleH5DirectAccess();
	
	return {
		app,
		pinia
	};
}
