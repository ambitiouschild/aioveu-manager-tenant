import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSCATEGORYBRAND_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-category-brand";

const PmsCategoryBrandAPI = {
    /** 获取商品分类与品牌关联表分页数据 */
    getPage(queryParams?: PmsCategoryBrandPageQuery) {
        return request< PageResult<PmsCategoryBrandPageVO[]>>({
            url: `${PMSCATEGORYBRAND_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },
    /**
     * 获取商品分类与品牌关联表表单数据
     *
     * @param id 商品分类与品牌关联表ID
     * @returns 商品分类与品牌关联表表单数据
     */
    getFormData(id: number) {
        return request< PmsCategoryBrandForm>({
            url: `${PMSCATEGORYBRAND_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品分类与品牌关联表
     *
     *  @param data 商品分类与品牌关联表表单数据
     */
    add(data: PmsCategoryBrandForm) {
        return request({
            url: `${PMSCATEGORYBRAND_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新商品分类与品牌关联表
     *
     * @param id 商品分类与品牌关联表ID
     * @param data 商品分类与品牌关联表表单数据
     */
     update(id: number, data: PmsCategoryBrandForm) {
        return request({
            url: `${PMSCATEGORYBRAND_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除商品分类与品牌关联表，多个以英文逗号(,)分割
     *
     * @param ids 商品分类与品牌关联表ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSCATEGORYBRAND_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsCategoryBrandAPI;

/** 商品分类与品牌关联表分页查询参数 */
export interface PmsCategoryBrandPageQuery extends PageQuery {
    /** 商品分类 */
    categoryId?: number;
    /** 商品品牌 */
    brandId?: number;
}

/** 商品分类与品牌关联表表单对象 */
export interface PmsCategoryBrandForm {
    /** 商品分类 */
    categoryId?:  number;
    /** 商品品牌 */
    brandId?:  number;
}

/** 商品分类与品牌关联表分页对象 */
export interface PmsCategoryBrandPageVO {
    /** 商品分类 */
    categoryId?: number;
    /** 商品品牌 */
    brandId?: number;
}
