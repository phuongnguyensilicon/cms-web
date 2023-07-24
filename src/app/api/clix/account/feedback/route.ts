import { convertLogoPath, createDefaultWatchProvider } from "@/mapping/streamer-image.logo";
import { IUserFeedbackRequest } from "@/model/account/userInfo";
import { redisService, metaDataService, mediaListNameService, accountService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum, TMDBSizeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";

export async function POST(req: Request, res: NextApiResponse) {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  
  const payload: IUserFeedbackRequest = await req.json();
  await accountService.addUserFeedback(token, payload);
  return handleResponse(null, StatusCodeEnum.OK);
}
