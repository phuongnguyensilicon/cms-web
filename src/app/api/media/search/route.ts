import { IBaseResponse } from "@/model/common/tmdp-response";
import { IMediaShortInfo } from "@/model/media/media";
import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ClixSearchType, StatusCodeEnum, TMDBMediaTypeEnum } from "@/utils/enum";
import qs from "qs";


const transformGetMediaRequest = (data: any): any => ({
  query: data.query,
  page: data.page,
  type: data.type,
  genre: data.genre,
  searchType: data.searchType
});


export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaRequest(qs.parse(rawParams));

    const pageNumber = Number(requestData.page);
    let result: IBaseResponse<IMediaShortInfo> = {
      page: !pageNumber ? 0: pageNumber ,
      results: [],
      totalPages: 0,
      totalResults: 0
    };
    
    const query = requestData.query ?? "";
    if (!pageNumber
      || (requestData.type === TMDBMediaTypeEnum.MOVIE && !query)
      || (requestData.type === TMDBMediaTypeEnum.TV && !query)) {
      return handleResponse(result, StatusCodeEnum.OK);
    }

    const type = (requestData.type ?? "").toLowerCase();
    switch(type) {
      case TMDBMediaTypeEnum.MOVIE.toLowerCase():
        result = await mediaService.getMovies(pageNumber, query);
        break;
      case TMDBMediaTypeEnum.TV.toLowerCase():
        result = await mediaService.getTvs(pageNumber, query);
        break;
      case ClixSearchType.PROMO_ADS:
        result = await mediaService.getImporteds(pageNumber, query, ClixSearchType.PROMO_ADS, requestData.genre);
        break;
      default:
        result = await mediaService.getImporteds(pageNumber, query, ClixSearchType.TITLE, requestData.genre);
        break;      
    }

    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}