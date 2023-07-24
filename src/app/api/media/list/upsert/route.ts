import { IUpdateMediaListNameRequest } from "@/model/media-list/media-list.name";
import { IImportMediaRequest } from "@/model/media/media";
import { mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import mediaService, { syncRecommendations } from "@services/media/media.service";


export async function POST(request: Request) {  
  try {  
    const payload: IUpdateMediaListNameRequest = await request.json();

    const result = await mediaListNameService.upsertMediaListName(payload);
    if (!result) {
      return throwResponseError("Upsert Invalid", StatusCodeEnum.BAD_REQUEST);
    }
    
    // await mediaService.updateRecommendations(payload.mediaItemIds);
    // syncRecommendations(payload.mediaItemIds);
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
