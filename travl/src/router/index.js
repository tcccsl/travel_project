import { createRouter, createWebHistory } from "vue-router"
import CreateDiary from '@/views/CreateDiary/index.vue'
import Detail from '@/views/Detail/index.vue'
import Home from '@/views/Home/index.vue'
import MyDiary from '@/views/MyDiary/index.vue'
import Tabber from '@/components/Tabber.vue'

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
        },
      ]
    }
  ]
  
})



export default router