import { IUserRewardInfo } from "@/model/account/userInfo";
import { IBaseResponse } from "@/model/common/tmdp-response";
import { IMediaShortInfo } from "@/model/media/media";
import { accountService, mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ClixSearchType, StatusCodeEnum, TMDBMediaTypeEnum } from "@/utils/enum";
import qs from "qs";


const transformGetMediaRequest = (data: any): any => ({
  query: data.query,
  page: data.page,
  isRedeem: !data.isRedeem 
            ? undefined
            : (data.isRedeem ?? '').toLowerCase() === 'true' 
              ? true
              : false,
});


export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaRequest(qs.parse(rawParams));

    const pageNumber = Number(requestData.page);
    let result: IBaseResponse<IUserRewardInfo> = {
      page: !pageNumber ? 0: pageNumber ,
      results: [],
      totalPages: 0,
      totalResults: 0
    };
    
    const query = requestData.query ?? "";
    if (!pageNumber) {
      return handleResponse(result, StatusCodeEnum.OK);
    }

    result = await accountService.getUserRewards(pageNumber, query, requestData.isRedeem);
    
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}