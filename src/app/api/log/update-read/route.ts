import { IImportMediaRequest, IUpdateMediaRequest, IUpdateReadLogTitle } from "@/model/media/media";
import { mediaService, mediaTmdbSyncService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function PUT(request: Request) {  
  try {  
    const payload: IUpdateReadLogTitle = await request.json();

    await mediaTmdbSyncService.updateReadLogByMediaItemIds([payload.id]);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
