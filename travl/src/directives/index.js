// 定义懒加载插件
import { useIntersectionObserver } from "@vueuse/core"

export const lazyPlugin={
  install(app){

    // 懒加载指令逻辑
    // 实现图片懒加载
    app.directive('img-lazy',{
      mounted(el,binding){
        // el：指令绑定的那个元素  img
        // binding：binding.value  指令等于号后面绑定的表达式值   图片url

        const {stop}=useIntersectionObserver(
          el,
          // 判读图片是否进入视口区域  isIntersecting为bool值
          ([{isIntersecting}]) =>{
            if(isIntersecting){
              // 进入视口区域后 判断将图片地址是否给el
              el.src=binding.value
              stop()
            }
            
          }
        )
        
      }
    })
  }
}