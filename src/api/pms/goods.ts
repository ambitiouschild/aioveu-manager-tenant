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

  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("登录使用客户端ID:", clientId);
	return request({
    url: `${AUTHSPU_BASE_URL}/spuLists?clientId=${clientId}`,
		method: "GET",
    data: params,
	})
}

/**
 * 获取秒杀商品列表
 * 
 * @param {Object} params
 */
export function listSeckillingSpus() {

  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("登录使用客户端ID:", clientId);

	return request({
    url: `${AUTHSECKILLING_BASE_URL}/seckilling?clientId=${clientId}`,
		method: "GET",
	})
}

/**
 * 获取商品详情
 *
 * @param {Object} spuId
 */
export function getSpuDetail(spuId: number) {

  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("登录使用客户端ID:", clientId);
	return request({
    url: `${AUTHSPUDETIL_BASE_URL}/${spuId}?clientId=${clientId}`,
		method: "GET"
	})
}

