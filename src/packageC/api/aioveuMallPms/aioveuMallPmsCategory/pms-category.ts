import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSCATEGORY_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-category";

const PmsCategoryAPI = {
    /** 获取商品分类分页数据 */
    getPage(queryParams?: PmsCategoryPageQuery) {
        return request<PageResult<PmsCategoryPageVO[]>>({
            url: `${PMSCATEGORY_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },

    /** 获取商品分类分页数据 */
    getListCategories(queryParams: object) {
      return request({
        url: `${PMSCATEGORY_BASE_URL}/categories`,
        method: "GET",
        data: queryParams,
      });
    },

    /** 获取商品分类分页数据 */
    getCategoryOptions() {
      return request({
        url: `${PMSCATEGORY_BASE_URL}/options`,
        method: "GET",
      });
    },

    /** 获取商品分类分页数据 */
    getCategoryDetail(id: number) {
      return request<PageResult<PmsCategoryPageVO[]>>({
        url: `${PMSCATEGORY_BASE_URL}/${id}`,
        method: "GET",
      });
    },



    /**
     * 获取商品分类表单数据
     *
     * @param id 商品分类ID
     * @returns 商品分类表单数据
     */
    getFormData(id: number) {
        return request<PmsCategoryForm>({
            url: `${PMSCATEGORY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品分类
     *
     *  @param data 商品分类表单数据
     */
    add(data: PmsCategoryForm) {
        return request({
            url: `${PMSCATEGORY_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新商品分类
     *
     * @param id 商品分类ID
     * @param data 商品分类表单数据
     */
     update(id: number, data: PmsCategoryForm) {
        return request({
            url: `${PMSCATEGORY_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 更新商品分类
     *
     * @param id 商品分类ID
     * @param data 商品分类表单数据
     */
    updateCategoryPart(id: number, data: PmsCategoryForm) {
      return request({
        url: `${PMSCATEGORY_BASE_URL}/${id}`,
        method: "POST",
        data,
      });
    },

    /**
     * 批量删除商品分类，多个以英文逗号(,)分割
     *
     * @param ids 商品分类ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSCATEGORY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsCategoryAPI;

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

/** 商品分类表单对象 */
export interface PmsCategoryForm {
    /** 主键 */
    id?:  number;
    /** 商品分类名称 */
    name?:  string;
    /** 父级ID */
    parentId?:  number;
    /** 层级 */
    level?:  number;
    /** 图标地址 */
    iconUrl?:  string;
    /** 排序 */
    sort?:  number;
    /** 显示状态:( 0:隐藏 1:显示) */
    visible?:  number;
}

/** 商品分类分页对象 */
export interface PmsCategoryPageVO {
    /** 主键 */
    id?: number;
    /** 商品分类名称 */
    name?: string;
    /** 父级ID */
    parentId?: number;
    /** 层级 */
    level?: number;
    /** 图标地址 */
    iconUrl?: string;
    /** 排序 */
    sort?: number;
    /** 显示状态:( 0:隐藏 1:显示) */
    visible?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
