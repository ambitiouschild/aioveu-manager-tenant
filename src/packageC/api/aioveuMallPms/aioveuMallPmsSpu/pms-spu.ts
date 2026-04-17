import request from "@/utils/request";  // default export
import { request2 } from "@/utils/request";  // named export
// import { SmsHomeCategoryPageVO } from "@/api/aioveuMall/aioveuMallSms/aioveuMallSmsHomeCategory/sms-home-category";
import {BaseQueryParams, PageQuery} from "@/types";

const PMSSPU_BASE_URL = "/aioveu-tenant-pms/api/v1/pms-spu";

const PmsSpuAPI = {
    /** 获取商品分页数据 */
    getPage(queryParams?: PmsSpuPageQuery) {
        return request< PageResult<PmsSpuPageVO[]>>({
          url: `${PMSSPU_BASE_URL}/page`,
          method: "GET",
          data: queryParams,
        });
    },

  /** 获取商品详情 */
  getSpuDetail(id: number) {
    return request({
      url: `${PMSSPU_BASE_URL}/${id}/detail`,
      method: "GET",
    });
  },


    /**
     * 获取商品表单数据
     *
     * @param id 商品ID
     * @returns 商品表单数据
     */
    getFormData(id: number) {
        return request< PmsSpuForm>({
            url: `${PMSSPU_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加商品
     *
     *  @param data 商品表单数据
     */
    add(data: PmsSpuForm) {
        return request({
            url: `${PMSSPU_BASE_URL}`,
            method: "POST",
            data,
        });
    },

    /**
     * 更新商品
     *
     * @param id 商品ID
     * @param data 商品表单数据
     */
     update(id: number, data: PmsSpuForm) {
        return request2({
            url: `${PMSSPU_BASE_URL}/admin/${id}`,
            method: "PUT",
            data,
        });
    },

    /**
     * 批量删除商品，多个以英文逗号(,)分割
     *
     * @param ids 商品ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${PMSSPU_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default PmsSpuAPI;

/** 商品分页查询参数 */
export interface PmsSpuPageQuery extends PageQuery {
    /** 商品名称 */
    name?: string;
    /** 商品类型ID */
    categoryId?: number;
    /** 商品品牌ID */
    brandId?: number;
    /** 商品简介 */
    description?: string;
    /** 商品状态(0:下架 1:上架) */
    status?: number;
}

/** 商品表单对象 */
export interface PmsSpuForm {
    /** 主键 */
    id?:  number;
    /** 商品名称 */
    name?:  string;
    /** 商品类型ID */
    categoryId?:  number;
    /** 商品品牌ID */
    brandId?:  number;
    /** 原价【起】 */
    originPrice?:  number;
    /** 现价【起】 */
    price?:  number;
    /** 销量 */
    sales?:  number;
    /** 商品主图 */
    picUrl?:  string;
    // /** 商品图册 */
    // album?:  string;

 // /** 商品图册 */
    album?: string[];  // 可选，类型是 string[]

    /** 单位 */
    unit?:  string;
    /** 商品简介 */
    description?:  string;
    /** 商品详情 */
    detail?:  string;
    /** 商品状态(0:下架 1:上架) */
    status?:  number;
}

/** 商品分页对象 */
export interface PmsSpuPageVO {
    /** 主键 */
    id?: number;
    /** 商品名称 */
    name?: string;
    /** 商品类型ID */
    categoryId?: number;
    /** 商品品牌ID */
    brandId?: number;
    /** 原价【起】 */
    originPrice?: number;
    /** 现价【起】 */
    price?: number;
    /** 销量 */
    sales?: number;
    /** 商品主图 */
    picUrl?: string;
    /** 商品图册 */
    album?: string[];  // 可选，类型是 string[]
    /** 单位 */
    unit?: string;
    /** 商品简介 */
    description?: string;
    /** 商品详情 */
    detail?: string;
    /** 商品状态(0:下架 1:上架) */
    status?: number;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;

  attrList: [];           // 商品属性列表
  specList: [];            // 商品规格列表
  skuList: [];             // 商品SKU列表

  stock: number;

  categoryName: string;// 总库存

  brandName: string;
}
