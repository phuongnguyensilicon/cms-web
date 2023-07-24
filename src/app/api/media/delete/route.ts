import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";

const transformDeleteMediaRequest = (data: any): any => ({
  ids: data.ids
});

export async function DELETE(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformDeleteMediaRequest(qs.parse(rawParams));
    const ids = requestData.ids;
    if (!ids || !ids.length) {
      return handleResponse(null, StatusCodeEnum.OK);
    }

    const idArrs: string[] = ids.split(",").map((id: string) => id).filter((id: string) => id);
    await mediaService.deleteMediaItemByIds(idArrs);
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}