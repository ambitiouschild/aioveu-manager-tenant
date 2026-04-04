import request from "@/utils/request";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSSPUATTRIBUTE_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-spu-attribute";

const PmsSpuAttributeAPI = {
    /** 获取商品类型（属性/规格）分页数据 */
    getPage(queryParams?: PmsSpuAttributePageQuery) {
        return request< PageResult<PmsSpuAttributePageVO[]>>({
            url: `${PMSSPUATTRIBUTE_BASE_URL}/page`,
            method: "GET",
            data: queryParams,
        });
    },

  /** 获取商品类型（属性/规格）列表 */
  getAttributeList(queryParams:any) {
    return request({
      url: `${PMSSPUATTRIBUTE_BASE_URL}`,
      method: "GET",
      data: queryParams,
    });
  },

    /**
     * 获取商品类型（属性/规格）表单数据
     *
     * @param id 商品类型（属性/规格）ID
     * @returns 商品类型（属性/规格）表单数据
     */
    getFormData(id: number) {
        return request< PmsSpuAttributeForm>({
            url: `${PMSSPUATTRIBUTE_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品类型（属性/规格）
     *
     *  @param data 商品类型（属性/规格）表单数据
     */
    add(data: PmsSpuAttributeForm) {
        return request({
            url: `${PMSSPUATTRIBUTE_BASE_URL}`,
            method: "POST",
            data,
        });
    },

      /**
       *  批量修改商品类型（属性/规格）
       *
       *  @param data 商品类型（属性/规格）表单数据
       */
      saveAttributeBatch(data: PmsSpuAttributeForm) {
        return request({
          url: `${PMSSPUATTRIBUTE_BASE_URL}/batch`,
          method: "POST",
          data,
        });
      },

    /**
     * 更新商品类型（属性/规格）
     *
     * @param id 商品类型（属性/规格）ID
     * @param data 商品类型（属性/规格）表单数据
     */
     update(id: number, data: PmsSpuAttributeForm) {
        return request({
            url: `${PMSSPUATTRIBUTE_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除商品类型（属性/规格），多个以英文逗号(,)分割
     *
     * @param ids 商品类型（属性/规格）ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSSPUATTRIBUTE_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsSpuAttributeAPI;

/** 商品类型（属性/规格）分页查询参数 */
export interface PmsSpuAttributePageQuery extends PageQuery {
    /** 产品ID */
    spuId?: number;
    /** 属性ID */
    attributeId?: number;
    /** 属性名称 */
    name?: string;
    /** 类型(1:规格;2:属性;) */
    type?: number;
}

/** 商品类型（属性/规格）表单对象 */
export interface PmsSpuAttributeForm {
    /** 主键 */
    id?:  number;
    /** 产品ID */
    spuId?:  number;
    /** 属性ID */
    attributeId?:  number;
    /** 属性名称 */
    name?:  string;
    /** 属性值 */
    value?:  string;
    /** 类型(1:规格;2:属性;) */
    type?:  number;
    /** 规格图片 */
    picUrl?:  string;
}

/** 商品类型（属性/规格）分页对象 */
export interface PmsSpuAttributePageVO {
    /** 主键 */
    id?: number;
    /** 产品ID */
    spuId?: number;
    /** 属性ID */
    attributeId?: number;
    /** 属性名称 */
    name?: string;
    /** 属性值 */
    value?: string;
    /** 类型(1:规格;2:属性;) */
    type?: number;
    /** 规格图片 */
    picUrl?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
}
