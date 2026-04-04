import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const PMSCATEGORY_BASE_URL = "/aioveu-tenant-pms/app-api/v1";

const AUTHCATEGORY_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

export function getCategoryList(queryParams: PmsCategoryPageQuery) {
  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("登录使用客户端ID:", clientId);


	return request({
    url: `${AUTHCATEGORY_BASE_URL}/goodsCategories?clientId=${clientId}`,
		method: "GET",
    data:queryParams,
	})
}



/** 商品分类分页查询参数 */
export interface PmsCategoryPageQuery extends PageQuery {
  /** 商品分类名称 */
  name?: string;
  /** 父级ID */
  parentId?: number;
  /** 图标地址 */
  iconUrl?: string;
  /** 排序 */
  sort?: number;
  /** 显示状态:( 0:隐藏 1:显示) */
  visible?: number;
}
