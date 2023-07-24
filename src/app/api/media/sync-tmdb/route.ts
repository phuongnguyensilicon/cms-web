import { mediaService, mediaTmdbSyncService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";

const transformUrl = (data: any): any => ({
  id: data.id
});


export async function POST(req: Request) {  
  try {  
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformUrl(qs.parse(rawParams));

    if (requestData?.id) {
      await mediaTmdbSyncService.syncMediaItemTmdb(requestData?.id);
    }
    
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
