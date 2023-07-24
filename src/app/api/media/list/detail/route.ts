import { mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";


const transformUrl = (data: any): any => ({
  id: data.id
});


export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformUrl(qs.parse(rawParams));
    
    if (!requestData.id) {
      return throwResponseError("Id Invalid", StatusCodeEnum.BAD_REQUEST);
    }

    const result = await mediaListNameService.getListNameDetailById(requestData.id);
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}