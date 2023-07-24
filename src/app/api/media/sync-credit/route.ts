import { mediaService, syncService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";

const transform = (data: any): any => ({
  id: data.id
});

export async function POST(request: Request) {  
  try {  

    const rawParams = request.url?.split("?")[1] || "";
    const requestData = transform(qs.parse(rawParams));

    await syncService.syncCreditsById(requestData.id);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
