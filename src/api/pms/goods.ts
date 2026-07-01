import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const PMS_BASE_URL = "/aioveu/api/v8/app/pms/spu";

/**
 * 获取商品分页列表
 * 
 * @param {Object} params
 */
export function listSpuPages(params:any) {

	return request({
    url: `${PMS_BASE_URL}/pages`,
    method: "GET",
    data: params,
    header: {
      skipAuth: true,
    },
  });
}

/**
 * 获取秒杀商品列表
 * 
 * @param {Object} params
 */
export function listSeckillingSpus() {

	return request({
    url: `${PMS_BASE_URL}/seckilling`,
    method: "GET",
    header: {
      skipAuth: true,
    },
  });
}

/**
 * 获取商品详情
 *
 * @param {Object} spuId
 */
export function getSpuDetail(spuId: number) {
  return request({
    url: `${PMS_BASE_URL}/spuDetail/${spuId}`,
    method: "GET",
    header: {
      skipAuth: true,
    },
  });
}

