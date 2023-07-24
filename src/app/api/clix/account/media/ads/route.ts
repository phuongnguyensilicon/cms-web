import { IBaseUserMediaRequest, IUserAnswerRequest } from "@/model/questionaire/questionaire";
import { questionaireService, userMediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";

const viewAds = async (req: Request, res: NextApiResponse) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const payload: IBaseUserMediaRequest = await req.json();
  await userMediaService.submitViewAds(token, payload.mediaItemId);
  return handleResponse(null, StatusCodeEnum.OK);
}

export { viewAds as POST };