import { IImportMediaRequest, IUpdateMediaRequest } from "@/model/media/media";
import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function PUT(request: Request) {  
  try {  
    const payload: IUpdateMediaRequest = await request.json();

    await mediaService.updateMedia(payload);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
