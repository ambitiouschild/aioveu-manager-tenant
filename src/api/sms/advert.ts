
import request from '@/utils/request'
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


//这是用户端banner
const SMSADVERT_BASE_URL = "/aioveu/api/v8/app/sms/adverts";

export function getAdvertList() {

  return request({
    url: `${SMSADVERT_BASE_URL}/banners`,
    method: "GET",
    header: {
      skipAuth: true,
    },
  });
}
