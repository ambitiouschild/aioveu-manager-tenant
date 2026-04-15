import request from "@/utils/request";
import type { FileInfo, ApiResponse } from "@/types/api";
import {getToken} from "@/utils/cache";


// H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
let baseApi = import.meta.env.VITE_APP_API_URL;
// #ifdef H5
baseApi = import.meta.env.VITE_APP_BASE_API;
// #endif

const FILE_BASE_URL = baseApi + "/aioveu-tenant/api/v1/files";

interface UploadOptions {
  category?: string;       // 文件分类
  type?: string;          // 文件类型
  businessId?: string;    // 业务ID
  fileName?: string;      // 自定义文件名
  onProgress?: (percent: number) => void; // 进度回调
}

// UniApp 特定的上传参数
interface UniUploadOptions extends UploadOptions {
  filePath: string;       // 临时文件路径
}

const FileAPI = {
  /**
   * UniApp 环境上传文件
   * @param options 上传选项
   */
  uploadUniFile(options: UniUploadOptions): Promise<ApiResponse<FileInfo>> {
    return new Promise((resolve, reject) => {
      const { filePath, onProgress, ...formData } = options;

      // 获取文件扩展名
      const ext = filePath.split('.').pop()?.toLowerCase() || '';

      uni.uploadFile({
        url: FILE_BASE_URL,
        filePath: filePath,
        name: 'file',
        formData: {
          ...formData,
          // 确保必需的字段
          category: formData.category || 'default',
          type: formData.type || 'common',
          fileName: formData.fileName || `file_${Date.now()}.${ext}`
        },

        header: {
          'Authorization': getToken() ? `Bearer ${getToken()}` : "",
          'Content-Type': 'multipart/form-data'
        },
        success: (uploadRes) => {
          if (uploadRes.statusCode === 200) {
            try {
              const data = JSON.parse(uploadRes.data);
              resolve(data);
            } catch (error) {
              reject(new Error('解析响应失败'));
            }
          } else {
            reject(new Error(`上传失败，状态码: ${uploadRes.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  /**
   * 批量上传文件（UniApp）
   * @param files 文件路径数组
   * @param options 上传选项
   */
  uploadMultiple(files: string[], options: UploadOptions = {}): Promise<{
    successful: FileInfo[];
    failed: { file: string; error: any }[];
  }> {
    const uploadPromises = files.map(filePath =>
      this.uploadUniFile({ filePath, ...options })
        .then(res => ({
          success: true,
          data: res.data,
          filePath }))
        .catch(error => ({
          success: false,
          error,
          filePath }))
    );

    return Promise.all(uploadPromises).then(results => {
      const successful: FileInfo[] = [];
      const failed: { file: string; error: any }[] = [];

      results.forEach(result => {
        if (result.success) {
          // 使用类型断言确保类型安全
          const successResult = result as { success: boolean; data: FileInfo; filePath: string };

          successful.push(successResult.data);
        } else {

          const failResult = result as { success: boolean; error: any; filePath: string };
          failed.push({
            file: result.filePath,
            error: failResult.error
          });
        }
      });

      return { successful, failed };
    });
  },

  /**
   * Web 环境上传文件（保留原接口）
   * Web 环境上传文件 - 使用原生 fetch 或 XMLHttpRequest
   * 因为 uni.request 不支持文件上传
   * @param formData FormData
   * @param onProgress 进度回调
   */
  upload(formData: FormData, onProgress?: (percent: number) => void): Promise<ApiResponse<FileInfo>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', FILE_BASE_URL);
      xhr.setRequestHeader('Authorization', getToken() ? `Bearer ${getToken()}` : "");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText) as ApiResponse<FileInfo>;
            resolve(data);
          } catch (error) {
            reject(new Error('解析响应失败'));
          }
        } else {
          reject(new Error(`上传失败，状态码: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('网络错误'));
      };

      xhr.send(formData);
    });
  },
  // upload(formData: FormData, onProgress?: (percent: number) => void) {
  //   return request<FileInfo>({
  //     url: `${FILE_BASE_URL}`,
  //     method: "POST",
  //     data: formData,
  //     header: { "Content-Type": "multipart/form-data" }, // 注意：这里改为 header
  //     onUploadProgress: (progressEvent: any) => {
  //       if (progressEvent.total) {
  //         const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //         onProgress?.(percent);
  //       }
  //     },
  //   });
  // },

  /**
   * Web 环境上传文件（保留原接口）
   * @param file File 对象
   */
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<FileInfo>({
      url: `${FILE_BASE_URL}`,
      method: "POST",
      data: formData,
      header: { "Content-Type": "multipart/form-data" }, // 注意：这里改为 header
    });
  },

  /** 删除文件 */
  delete(filePath?: string) {
    return request({
      url: `${FILE_BASE_URL}`,
      method: "DELETE",
      data: { filePath },
    });
  },

  /** 下载文件（Web环境） */
  download(url: string, fileName?: string) {
    return request({
      url,
      method: "GET",
      responseType: "blob",
    }as any).then((res : any) => {
      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      const urlObject = window.URL.createObjectURL(blob);
      a.href = urlObject;
      a.download = fileName || "下载文件";
      a.click();
      window.URL.revokeObjectURL(urlObject);
    });
  },

  /** UniApp 下载文件 */
  downloadInUniApp(url: string, fileName?: string) {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            const filePath = res.tempFilePath;

            // 保存到相册（需要权限）
            uni.saveImageToPhotosAlbum({
              filePath: filePath,
              success: () => {
                uni.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
                resolve(res);
              },
              fail: (err) => {
                console.error('保存失败:', err);
                reject(err);
              }
            });
          } else {
            reject(new Error(`下载失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
};

export default FileAPI;
