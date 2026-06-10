import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const PMSSPU_BASE_URL = "/aioveu-tenant-pms/app-api/v1/spu";

const AUTHSECKILLING_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

const AUTHSPU_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

const AUTHSPUDETIL_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth/spuDetail";
/**
 * 获取商品分页列表
 * 
 * @param {Object} params
 */
export function listSpuPages(params:any) {

	return request({
    url: `${AUTHSPU_BASE_URL}/spuLists`,
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
    url: `${AUTHSECKILLING_BASE_URL}/seckilling`,
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
    url: `${AUTHSPUDETIL_BASE_URL}/${spuId}`,
    method: "GET",
    header: {
      skipAuth: true,
    },
  });
}

