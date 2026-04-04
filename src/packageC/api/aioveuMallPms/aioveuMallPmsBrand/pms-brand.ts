import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSBRAND_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-brand";

const PmsBrandAPI = {
    /** 获取商品品牌分页数据 */
    getPage(queryParams?: PmsBrandPageQuery) {
        return request<PageResult<PmsBrandPageVO[]>>({
            url: `${PMSBRAND_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },

  /** 获取商品品牌列表 */
  getBrandList(queryParams?: PmsBrandPageQuery) {
    return request({
      url: `${PMSBRAND_BASE_URL}`,
      method: "GET",
      data: queryParams,
    });
  },
    /**
     * 获取商品品牌表单数据
     *
     * @param id 商品品牌ID
     * @returns 商品品牌表单数据
     */
    getFormData(id: number) {
        return request< PmsBrandForm>({
            url: `${PMSBRAND_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品品牌
     *
     *  @param data 商品品牌表单数据
     */
    add(data: PmsBrandForm) {
        return request({
            url: `${PMSBRAND_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新商品品牌
     *
     * @param id 商品品牌ID
     * @param data 商品品牌表单数据
     */
     update(id: number, data: PmsBrandForm) {
        return request({
            url: `${PMSBRAND_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除商品品牌，多个以英文逗号(,)分割
     *
     * @param ids 商品品牌ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSBRAND_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsBrandAPI;

/** 商品品牌分页查询参数 */
export interface PmsBrandPageQuery extends PageQuery {
    /** 品牌名称 */
    name?: string;
}

/** 商品品牌表单对象 */
export interface PmsBrandForm {
    /** 主键 */
    id?:  number;
    /** 品牌名称 */
    name?:  string;
    /** LOGO图片 */
    logoUrl?:  string;
    /** 排序 */
    sort?:  number;
}

/** 商品品牌分页对象 */
export interface PmsBrandPageVO {
    /** 主键 */
    id?: number;
    /** 品牌名称 */
    name?: string;
    /** LOGO图片 */
    logoUrl?: string;
    /** 排序 */
    sort?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
