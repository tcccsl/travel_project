// axios基础封装

import axios from "axios"
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import router from "@/router"
const httpInstance=axios.create({
  baseURL:'http://pcapi-xiaotuxian-front-devtest.itheima.net',
  timeout:15000
})

// 拦截器

// axios请求拦截器


  
// axios响应式拦截器
httpInstance.interceptors.response.use(res => res.data, e => {
  // 统一错误提示
  ElMessage({
    type:'warning',
    message:e.response.data.message
  })

  
})

export default httpInstance
