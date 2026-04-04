import request from "@/utils/request";
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";

const SMSHOMEADVERT_BASE_URL = "/aioveu-tenant-sms/app-api/v1/sms-home-advert";

const AUTHADVERT_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

const SmsHomeAdvertAPI = {
    /** 获取首页广告配置（增加跳转路径）分页数据 */
    getPage(queryParams?: SmsHomeAdvertPageQuery) {

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
      // // 使用URLSearchParams或手动拼接
      // const queryString = new URLSearchParams(allParams).toString();
      //
      // console.log("使用URLSearchParams或手动拼接:", queryString);

        return request<PageResult<SmsHomeAdvertPageVO[]>>({
            url: `${AUTHADVERT_BASE_URL}/adverts?clientId=${clientId}`,
            method: "GET",
            data: clientId,  // 加入 clientId, //GET 请求通常不应该有请求体，参数应该通过 URL 查询字符串传递
        });
    },
    /**
     * 获取首页广告配置（增加跳转路径）表单数据
     *
     * @param id 首页广告配置（增加跳转路径）ID
     * @returns 首页广告配置（增加跳转路径）表单数据
     */
    getFormData(id: number) {
        return request<SmsHomeAdvertForm>({
            url: `${SMSHOMEADVERT_BASE_URL}/${id}/form`,
            method: "GET",
        });
    },

    /**
     *  添加首页广告配置（增加跳转路径）
     *
     *  @param data 首页广告配置（增加跳转路径）表单数据
     */
    add(data: SmsHomeAdvertForm) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}`,
            method: "POST",
            data: data,
        });
    },

    /**
     * 更新首页广告配置（增加跳转路径）
     *
     * @param id 首页广告配置（增加跳转路径）ID
     * @param data 首页广告配置（增加跳转路径）表单数据
     */
     update(id: number, data: SmsHomeAdvertForm) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}/${id}`,
            method: "PUT",
            data: data,
        });
    },

    /**
     * 批量删除首页广告配置（增加跳转路径），多个以英文逗号(,)分割
     *
     * @param ids 首页广告配置（增加跳转路径）ID字符串，多个以英文逗号(,)分割
     */
     deleteByIds(ids: string) {
        return request({
            url: `${SMSHOMEADVERT_BASE_URL}/${ids}`,
            method: "DELETE",
        });
    }
}

export default SmsHomeAdvertAPI;

/** 首页广告配置（增加跳转路径）分页查询参数 */
export interface SmsHomeAdvertPageQuery extends PageQuery {
    /** 关联广告ID（sms_advert表） */
    advertId?: number;
    /** 广告显示名称 */
    homeAdvertName?: string;
    /** 图片模式 */
    imageMode?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 排序 */
    sort?: number;
    /** 状态：0-隐藏，1-显示 */
    status?: number;
    /** 逻辑删除：0-正常 1-删除 */
    deleted?: number;
}

/** 首页广告配置（增加跳转路径）表单对象 */
export interface SmsHomeAdvertForm {
    /** 主键ID */
    id?:  number;
    /** 关联广告ID（sms_advert表） */
    advertId?:  number;
    /** 广告显示的图标URL */
    homeAdvertIcon?:  string;
    /** 广告显示名称 */
    homeAdvertName?:  string;
    /** 高度（rpx/upx） */
    height?:  number;
    /** 图片模式 */
    imageMode?:  string;
    /** 跳转路径 */
    jumpPath?:  string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?:  string;
    /** 跳转参数（JSON格式） */
    jumpParams?:  string;
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

/** 首页广告配置（增加跳转路径）分页对象 */
export interface SmsHomeAdvertPageVO {
    /** 主键ID */
    id?: number;
    /** 关联广告ID（sms_advert表） */
    advertId?: number;
    /** 广告显示的图标URL */
    homeAdvertIcon?: string;
    /** 广告显示名称 */
    homeAdvertName?: string;
    /** 高度（rpx/upx） */
    height?: number;
    /** 图片模式 */
    imageMode?: string;
    /** 跳转路径 */
    jumpPath?: string;
    /** 跳转类型：navigateTo, redirectTo, switchTab */
    jumpType?: string;
    /** 跳转参数（JSON格式） */
    jumpParams?: string;
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
