import { IListNameChangeOrderRequest, IUpdateMediaListNameRequest } from "@/model/media-list/media-list.name";
import { IImportMediaRequest } from "@/model/media/media";
import { mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function POST(request: Request) {  
  try {  
    const payload: IListNameChangeOrderRequest = await request.json();

    const result = await mediaListNameService.changeListOrder(payload);
    if (!result) {
      return throwResponseError("Change order fail", StatusCodeEnum.BAD_REQUEST);
    }
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
