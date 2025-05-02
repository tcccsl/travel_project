import { createRouter, createWebHistory } from "vue-router"
import CreateDiary from '@/views/CreateDiary/index.vue'
import Detail from '@/views/Detail/index.vue'
import Home from '@/views/Home/index.vue'
import MyDiary from '@/views/MyDiary/index.vue'
import Tabber from '@/components/Tabber.vue'
import Login from '@/views/Login/index.vue'
import Register from '@/views/Register/index.vue'

const router=createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes:[
    {
      component:Tabber,
      path:'/',
      
      children:[
        {
          path:"/",
          name:'home',
          component: Home
        },{ 
          path: '/create', 
          name: 'CreateDiary', 
          component: CreateDiary 
        },
        { 
          path: '/my-diary', 
          name: 'MyDiary', 
          component: MyDiary 
        },{ 
          path: '/detail/:id', 
          name: 'Detail', 
          component: Detail 
        },{
          path: '/login',
          name: 'Login',
          component: Login
        },{
          path: '/register',
          name: 'Register',
          component: Register
        }
      ]
    }
  ]
  
})

// 添加全局路由守卫来处理页面切换动画
router.beforeEach((to, from, next) => {
  const toDepth = to.path.split('/').length;
  const fromDepth = from.path.split('/').length;
  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left';
  next();
});

export default router