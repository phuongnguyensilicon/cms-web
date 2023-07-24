import { IUpdateVisibilityRequest } from "@/model/media-list/media-list.name";
import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function PUT(request: Request) {  
  try {  
    const payload: IUpdateVisibilityRequest = await request.json();

    if (!payload.id) {
      return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
    }

    await mediaService.updateVisibleMedia(payload.id, payload.isVisibility);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
