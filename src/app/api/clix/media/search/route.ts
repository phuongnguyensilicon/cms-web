import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum, TMDBMediaTypeEnum } from "@/utils/enum";
import qs from "qs";


const transformGetMediaForListItemRequest = (data: any): any => ({
  query: data.query,
  offset: data.offset
});

export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaForListItemRequest(qs.parse(rawParams));
    const query = requestData.query ?? "";

    const offset = Number(requestData.offset) ?? 0;
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    const result = await mediaService.searchMedia(query, offset, token ?? undefined);
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}