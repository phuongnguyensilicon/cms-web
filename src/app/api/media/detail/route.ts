import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { IGetMediaDetailRequest, IMediaShortInfo } from "@/model/media/media";
import qs from "qs";
import { MediaDetailSourceEnum, StatusCodeEnum } from "@/utils/enum";

const transformGetMediaRequest = (data: any): IGetMediaDetailRequest => ({
  mediaItemId: data.id,
  source: data.source
});

export async function GET(req: Request) {
  try {
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaRequest(qs.parse(rawParams));
    const source = (requestData.source ?? "").toLowerCase();
    switch(source) {
      case MediaDetailSourceEnum.TMDB.toLowerCase():
        {
          const response = await mediaService.getTmdbMediaDetail(requestData.mediaItemId);
          if (!response) {
            return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
          }
          return handleResponse(response);
        }
      default:
        {
          let response = await mediaService.getMediaDetail(requestData.mediaItemId);
          if (!response) {
            return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
          }

          if (!response.watchProviders?.length) {
            response.watchProvider = undefined;
          }
          return handleResponse(response);
        }
    }
    
    
    return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
