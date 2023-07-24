import { mediaListNameService, mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";

export async function POST(req: Request) {
  try {   
    
    await mediaService.syncRecommendationInList();
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}