
import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const SMSADVERT_BASE_URL = "/aioveu-tenant-sms/app-api/v1/adverts";

const AUTHBANNERS_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

export function getAdvertList() {
  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("登录使用客户端ID:", clientId);


  return request({
    url: `${AUTHBANNERS_BASE_URL}/manager-home-banner?clientId=${clientId}`,
    method: "GET"
  })
}
