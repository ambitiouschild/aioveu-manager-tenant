import request from "@/utils/request";
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";

const SMSHOMECATEGORY_BASE_URL = "/aioveu-tenant-sms/app-api/v1/sms-home-category";


const AUTHCATEGORY_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

const SmsHomeCategoryAPI = {
    /** 获取首页分类配置分页数据 */
    getPage(queryParams?: SmsHomeCategoryPageQuery) {

      //您封装的 request函数使用了不同的参数名，比如可能叫 data、query或 paramsData
      //是的！您找到了问题的根源。您的 request函数是专门为 uni-app 环境封装的，而且它不支持 params参数。
      //没有 params字段！所以当您传递 params时，TypeScript 会报错，而且这些参数不会被发送。
      //关键点：
      // uni.request 没有 params参数
      //GET请求的参数必须通过URL查询字符串传递
      //您需要手动拼接参数到URL中
      const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
      console.log("登录使用客户端ID:", clientId);

      // // 构建查询字符串
      // // 将所有值转换为字符串
      // const allParams: Record<string, string> = {
      //   clientId: String(clientId)
      // };
      //
      // // 如果有其他参数，也转换为字符串
      // if (queryParams) {
      //   for (const [key, value] of Object.entries(queryParams)) {
      //     if (value !== undefined && value !== null) {
      //       allParams[key] = String(value);
      //     }
      //   }
      // }
      //
      // //这个错误是因为在小程序环境中，URLSearchParams可能不被支持。您需要改用其他方法来构建查询字符串。
      // // 使用URLSearchParams或手动拼接
      // //在小程序环境中，有些Web API（如 URLSearchParams、FormData等）可能不被完全支持。您需要在 request.ts文件中看到，已经有一个 buildQueryString函数专门处理这个问题。
      // const queryString = buildQueryString(allParams);
      // console.log("使用URLSearchParams或手动拼接:", queryString);
      //<PageResult<SmsHomeCategoryPageVO[]>>
        return request({
            url: `${AUTHCATEGORY_BASE_URL}/categories?clientId=${clientId}`,
            method: "GET",
            data: clientId,  // 加入 clientId,  //GET 请求通常不应该有请求体，参数应该通过 URL 查询字符串传递
        });
    },


    /**
     * 获取首页分类配置表单数据
     *
     * @param id 首页分类配置ID
     * @returns 首页分类配置表单数据
     */
    getFormData(id: number) {
        return request<SmsHomeCategoryForm>({
            url: `${SMSHOMECATEGORY_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加首页分类配置
     *
     *  @param data 首页分类配置表单数据
     */
    add(data: SmsHomeCategoryForm) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新首页分类配置
     *
     * @param id 首页分类配置ID
     * @param data 首页分类配置表单数据
     */
     update(id: number, data: SmsHomeCategoryForm) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除首页分类配置，多个以英文逗号(,)分割
     *
     * @param ids 首页分类配置ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${SMSHOMECATEGORY_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default SmsHomeCategoryAPI;

/** 首页分类配置分页查询参数 */
export interface SmsHomeCategoryPageQuery extends PageQuery {
    /** 关联商品分类ID（pms_category表） */
    categoryId?: number;
    /** 首页显示名称 */
    homeName?: string;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
}

/** 首页分类配置表单对象 */
export interface SmsHomeCategoryForm {
    id?:  number;
    /** 关联商品分类ID（pms_category表） */
    categoryId?:  number;
    /** 首页显示的图标URL */
    homeIcon?:  string;
    /** 首页显示名称 */
    homeName?:  string;
    /** 跳转路径 */
    jumpPath?:  string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?:  string;
    /** 排序 */
    sort?:  number;
    /** 状态：0-隐藏，1-显示 */
    status?:  number;
    /** 备注 */
    remark?:  string;
    /** 创建时间 */
    createTime?:  Date;
    /** 更新时间 */
    updateTime?:  Date;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?:  number;
    /** 版本号（用于乐观锁） */
    version?:  number;
}

/** 首页分类配置分页对象 */
export interface SmsHomeCategoryPageVO {
    id?: number;
    /** 关联商品分类ID（pms_category表） */
    categoryId?: number;
    /** 首页显示的图标URL */
    homeIcon?: string;
    /** 首页显示名称 */
    homeName?: string;
    /** 跳转路径 */
    jumpPath?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 排序 */
    sort?: number;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: Date;
    /** 更新时间 */
    updateTime?: Date;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
    /** 版本号（用于乐观锁） */
    version?: number;
}
