import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import { userAuthPages, adminAuthPages, handleH5DirectAccess } from "./utils/routerHelper";

// 设置网络请求拦截器和错误处理
function setupNetworkInterceptors() {
	// 请求拦截器
	uni.addInterceptor('request', {
		invoke(args) {
			console.log('发起请求:', args.url);
			
			// 设置请求超时时间
			if (!args.timeout) {
				args.timeout = 60000; // 60秒
			}
			
			// 确保完整URL（Android需要）
			if (args.url && !args.url.startsWith('http')) {
				args.url = 'http://' + args.url;
			}
			
			// 确保Android设备可以访问HTTP请求
			// #ifdef APP-PLUS
			if (plus.os.name.toLowerCase() === 'android') {
				if (args.url.startsWith('http://')) {
					console.log('Android设备发起HTTP请求:', args.url);
					
					// 设置Android特定的请求头
					if (!args.header) args.header = {};
					args.header['Accept'] = '*/*';
					args.header['Connection'] = 'keep-alive';
				}
				
				// 每次请求前检查网络
				checkAndroidNetwork();
			}
			// #endif
			
			return args;
		},
		success(res) {
			console.log('请求成功:', res.statusCode);
			return res;
		},
		fail(err) {
			console.error('请求失败:', err);
			
			// 处理不同的错误类型
			if (err.errMsg.includes('timeout')) {
				uni.showToast({
					title: '请求超时，请检查网络',
					icon: 'none'
				});
			} else if (err.errMsg.includes('Failed to connect')) {
				uni.showToast({
					title: '连接服务器失败，请检查网络',
					icon: 'none'
				});
			}
			
			return err;
		},
		complete(res) {
			// 可以在这里添加通用的请求完成处理
			return res;
		}
	});
}

// 检查Android网络连接状态
function checkAndroidNetwork() {
	// #ifdef APP-PLUS
	if (plus.os.name.toLowerCase() === 'android') {
		plus.networkinfo.getCurrentType(function(networkType) {
			console.log('当前网络类型:', networkType);
			
			const networkTypeMap = {
				'unknow': '未知网络',
				'none': '无网络',
				'ethernet': '有线网络',
				'wifi': 'WiFi',
				'2g': '2G蜂窝网络',
				'3g': '3G蜂窝网络',
				'4g': '4G蜂窝网络',
				'cell': '蜂窝网络'
			};
			
			const networkName = networkTypeMap[networkType] || '未知类型';
			console.log('网络连接类型:', networkName);
			
			if (networkType === 'none') {
				uni.showToast({
					title: '当前无网络连接',
					icon: 'none',
					duration: 3000
				});
			}
		});
	}
	// #endif
}

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
	
	// 设置调试模式全局变量
	app.config.globalProperties.$debug = true;
	
	// 添加全局辅助方法
	app.config.globalProperties.$util = {
		// 验证URL是否包含协议
		ensureUrlWithProtocol: (url) => {
			if (!url) return '';
			return url.startsWith('http') ? url : `http://${url}`;
		},
		// 检查并修复请求URL
		fixRequestUrl: (url) => {
			const API_URL = 'http://121.40.88.145:3000';
			
			if (!url) return API_URL;
			if (url.startsWith('http')) return url;
			if (url.startsWith('/')) return `${API_URL}${url}`;
			return `${API_URL}/${url}`;
		}
	};
	
	// 设置网络请求拦截器
	setupNetworkInterceptors();
	
	// 设置导航守卫
	setupNavigationGuards();
	
	// 处理 H5 直接访问
	handleH5DirectAccess();
	
	return {
		app,
		pinia
	};
}
