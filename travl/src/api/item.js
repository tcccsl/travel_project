import httpInstance from "../utils/http";


/**
 * @description: 获取导航数据
 * @data { 
     categoryId: 1005000 ,
     page: 1,
     pageSize: 20,
     sortField: 'publishTime' | 'orderNum' | 'evaluateNum'
   } 
 * @return {*}
 */
export const getItemApi=(data)=>{
  return httpInstance({
    url:'/category/goods/temporary',
    method:'POST',
    data
  })
}