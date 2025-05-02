import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 获取用户信息
const user = userStore.getUserInfo()

// 检查是否登录
const isLoggedIn = userStore.getLoginStatus()

// 获取 token
const token = userStore.getToken()
