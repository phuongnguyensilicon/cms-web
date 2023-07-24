import { mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";


const transformUrl = (data: any): any => ({
  name: data.name
});


export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformUrl(qs.parse(rawParams));

    if (!requestData.name) {
      return handleResponse({isValid: false}, StatusCodeEnum.OK);
    }

    const isValid = await mediaListNameService.checkListNameValid(requestData.name);
    return handleResponse({isValid: isValid}, StatusCodeEnum.OK);
    
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}