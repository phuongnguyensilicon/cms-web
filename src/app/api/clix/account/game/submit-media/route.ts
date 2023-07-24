import { IUpdateGameGenreMediaRequest } from "@/model/media/media";
import {  userMediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";


export async function PUT(req: Request) {  
  try {  
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    if (!token) {
      return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
    }

    const payload: IUpdateGameGenreMediaRequest = await req.json();

    await userMediaService.updateGameGenreMedia(token, payload);
    
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
