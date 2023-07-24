import { mediaService, syncService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";

const transform = (data: any): any => ({
  isProcessForList: data.isProcessForList === 'true',
  isSyncVideo: data.isSyncVideo === 'true',
  isSyncCredit: data.isSyncCredit === 'true'
});

export async function POST(request: Request) {  
  try {  

    const rawParams = request.url?.split("?")[1] || "";
    const requestData = transform(qs.parse(rawParams));

    await syncService.syncMedias(requestData.isProcessForList, requestData.isSyncVideo, requestData.isSyncCredit);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
