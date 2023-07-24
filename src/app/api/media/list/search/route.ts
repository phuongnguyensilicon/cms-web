import { IBaseResponse } from "@/model/common/tmdp-response";
import { IMediaListNameInfo } from "@/model/media-list/media-list.name";
import { mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";


const transformGetMediaRequest = (data: any): any => ({
  query: data.query,
  page: data.page
});


export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaRequest(qs.parse(rawParams));

    const pageNumber = Number(requestData.page);
    let result: IBaseResponse<IMediaListNameInfo> = {
      page: !pageNumber ? 0: pageNumber ,
      results: [],
      totalPages: 0,
      totalResults: 0
    };
    
    const query = requestData.query ?? "";
    if (!pageNumber) {
      return handleResponse(result, StatusCodeEnum.OK);
    }

    result = await mediaListNameService.getListNames(pageNumber, query);
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}