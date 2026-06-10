
import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const SMSADVERT_BASE_URL = "/aioveu-tenant-sms/app-api/v1/adverts";

const AUTHBANNERS_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

export function getAdvertList() {

  return request({
    url: `${AUTHBANNERS_BASE_URL}/manager-home-banner`,
    method: "GET",
    header: {
      skipAuth: true
    }
  })
}
