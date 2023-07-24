import { IImportMediaRequest } from "@/model/media/media";
import { mediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function POST(request: Request) {  
  try {  
    const payload: IImportMediaRequest = await request.json();

    await mediaService.importMedias(payload.tmdbIds, payload.type);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
