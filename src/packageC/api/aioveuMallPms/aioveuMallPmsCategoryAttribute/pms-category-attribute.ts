import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSCATEGORYATTRIBUTE_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-category-attribute";

const PmsCategoryAttributeAPI = {
    /** 获取商品类型（规格，属性）分页数据 */
    getPage(queryParams?: PmsCategoryAttributePageQuery) {
        return request< PageResult<PmsCategoryAttributePageVO[]>>({
            url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },

  /** 获取商品类型（规格，属性）分页数据 */
  getAttributeList(queryParams?: object) {
    return request({
      url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/attributes`,
      method: "GET",
      data: queryParams,
    });
  },
    /**
     * 获取商品类型（规格，属性）表单数据
     *
     * @param id 商品类型（规格，属性）ID
     * @returns 商品类型（规格，属性）表单数据
     */
    getFormData(id: number) {
        return request< PmsCategoryAttributeForm>({
            url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品类型（规格，属性）
     *
     *  @param data 商品类型（规格，属性）表单数据
     */
    add(data: PmsCategoryAttributeForm) {
        return request({
            url: `${PMSCATEGORYATTRIBUTE_BASE_URL}`,
            method: "POST",
            data,
        });
    },

  /**
   *  批量修改商品分类类型（规格，属性）
   *
   *  @param data 商品类型（规格，属性）表单数据
   */
  saveAttributeBatch(data: PmsCategoryAttributeForm) {
    return request({
      url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/batch`,
      method: "POST",
      data,
    });
  },

    /**
     * 更新商品类型（规格，属性）
     *
     * @param id 商品类型（规格，属性）ID
     * @param data 商品类型（规格，属性）表单数据
     */
     update(id: number, data: PmsCategoryAttributeForm) {
        return request({
            url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除商品类型（规格，属性），多个以英文逗号(,)分割
     *
     * @param ids 商品类型（规格，属性）ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSCATEGORYATTRIBUTE_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsCategoryAttributeAPI;

/** 商品类型（规格，属性）分页查询参数 */
export interface PmsCategoryAttributePageQuery extends PageQuery {
    /** 分类ID */
    categoryId?: number;
    /** 属性名称 */
    name?: string;
    /** 类型(1:规格;2:属性;) */
    type?: number;
}

/** 商品类型（规格，属性）表单对象 */
export interface PmsCategoryAttributeForm {
    /** 主键 */
    id?:  number;
    /** 分类ID */
    categoryId?:  number;
    /** 属性名称 */
    name?:  string;
    /** 类型(1:规格;2:属性;) */
    type?:  number;
}

/** 商品类型（规格，属性）分页对象 */
export interface PmsCategoryAttributePageVO {
    /** 主键 */
    id?: number;
    /** 分类ID */
    categoryId?: number;
    /** 属性名称 */
    name?: string;
    /** 类型(1:规格;2:属性;) */
    type?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
