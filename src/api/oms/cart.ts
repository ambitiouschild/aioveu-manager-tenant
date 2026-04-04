import request from '@/utils/request'


const OMSCART_BASE_URL = "/aioveu-tenant-oms/app-api/v1/carts";

// 查询购物车
export function getCart() {
	return request({
		url: `${OMSCART_BASE_URL}`,
		method: "GET",
		header: {
			'auth': true // 需要认证
		}
	})
}

/**
 * 全选/全不选
 * @param {Object} params
 */
export function checkAll(params :any) {
	return request({
		url: `${OMSCART_BASE_URL}/_check`,
		method: "PUT",
    data: params,
		header: {
			'auth': true
		}
	})
}


// 清空购物车
export function deleteCart() {
	return request({
    url: `${OMSCART_BASE_URL}`,
		method: "DELETE",
		header: {
			'auth': true
		}
	})
}


// 添加购物车
export function addCartItem(skuId :any , count = 1) {
	return request({
    url: `${OMSCART_BASE_URL}`,
		method: "POST",
    data: {
			skuId: skuId,
      count: count
		},
		header: { // 使用 data 传递参数
			'auth': true
		}
	})
}

// 更新购物车商品
export function updateCartItem(skuId :any, data :any) {
	return request({
    url: `${OMSCART_BASE_URL}/skuId/${skuId}`,
		method: "PUT",
		data: data,
		header: {
			'auth': true
		}
	})
}


// 批量删除购物车商品
export function removeCartItem(skuId :any , count = 1) {
	return request({
    url: `${OMSCART_BASE_URL}/skuId/${skuId}`,
		method: "DELETE",
		header: {
			'auth': true
		}
	})
}
