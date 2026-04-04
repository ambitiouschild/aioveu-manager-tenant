import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSSKU_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-sku";

const PmsSkuAPI = {
    /** 获取商品库存分页数据 */
    getPage(queryParams?: PmsSkuPageQuery) {
        return request<PageResult<PmsSkuPageVO[]>>({
            url: `${PMSSKU_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取商品库存表单数据
     *
     * @param id 商品库存ID
     * @returns 商品库存表单数据
     */
    getFormData(id: number) {
        return request< PmsSkuForm>({
            url: `${PMSSKU_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品库存
     *
     *  @param data 商品库存表单数据
     */
    add(data: PmsSkuForm) {
        return request({
            url: `${PMSSKU_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新商品库存
     *
     * @param id 商品库存ID
     * @param data 商品库存表单数据
     */
     update(id: number, data: PmsSkuForm) {
        return request({
            url: `${PMSSKU_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除商品库存，多个以英文逗号(,)分割
     *
     * @param ids 商品库存ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSSKU_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsSkuAPI;

/** 商品库存分页查询参数 */
export interface PmsSkuPageQuery extends PageQuery {
    /** 商品编码 */
    skuSn?: string;
    /** SPU ID */
    spuId?: number;
    /** 商品名称 */
    name?: string;
    /** 商品规格值，以英文逗号(,)分割 */
    specIds?: string;
}

/** 商品库存表单对象 */
export interface PmsSkuForm {
    /** 库存ID */
    id?:  number;
    /** 商品编码 */
    skuSn?:  string;
    /** SPU ID */
    spuId?:  number;
    /** 商品名称 */
    name?:  string;
    /** 商品规格值，以英文逗号(,)分割 */
    specIds?:  string;
    /** 商品价格(单位：分) */
    price?:  number;
    /** 库存数量 */
    stock?:  number;
    /** 库存锁定数量 */
    lockedStock?:  number;
    /** 商品图片地址 */
    picUrl?:  string;
}

/** 商品库存分页对象 */
export interface PmsSkuPageVO {
    /** 库存ID */
    id?: number;
    /** 商品编码 */
    skuSn?: string;
    /** SPU ID */
    spuId?: number;
    /** 商品名称 */
    name?: string;
    /** 商品规格值，以英文逗号(,)分割 */
    specIds?: string;
    /** 商品价格(单位：分) */
    price?: number;
    /** 库存数量 */
    stock?: number;
    /** 库存锁定数量 */
    lockedStock?: number;
    /** 商品图片地址 */
    picUrl?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
