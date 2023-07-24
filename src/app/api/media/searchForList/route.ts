import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum, TMDBMediaTypeEnum } from "@/utils/enum";
import qs from "qs";


const transformGetMediaForListItemRequest = (data: any): any => ({
  query: data.query,
  offset: data.offset,
  excepMediaItemIds: data.excludeIds
});

export async function GET(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformGetMediaForListItemRequest(qs.parse(rawParams));

    const excepMediaItemIdStr = requestData.excepMediaItemIds ?? '';
    const excepMediaItemIds = excepMediaItemIdStr.split(",")
              .map((item: string) => (item??"").trim())
              .filter ((item: string) => !!item);

    const query = requestData.query ?? "";

    const offset = Number(requestData.offset) ?? 0;

    const result = await mediaService.getMediaItemForListNames(query, offset, excepMediaItemIds);
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}