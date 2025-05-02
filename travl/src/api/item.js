import http from '@/utils/http';

/**
 * @description: 获取导航数据
 * @param {Object} data - 请求参数
 * @param {number} data.categoryId - 分类ID
 * @param {number} data.page - 页码
 * @param {number} data.pageSize - 每页数量
 * @param {string} data.sortField - 排序字段，可选值：'publishTime' | 'orderNum' | 'evaluateNum'
 * @returns {Promise} 返回商品列表数据
 */
export const getSubCategoryAPI = (data) => {
  return http({
    url: '/category/goods/temporary',
    method: 'POST',
    data
  });
};

/**
 * @description: 获取商品详情
 * @param {string} id - 商品ID
 * @returns {Promise} 返回商品详情数据
 */
export const getItemDetail = (id) => {
  return http.get(`/item/detail/${id}`);
};