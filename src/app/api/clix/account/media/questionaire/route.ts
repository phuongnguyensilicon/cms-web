import { IUserAnswerRequest } from "@/model/questionaire/questionaire";
import { questionaireService, userMediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";
import qs from "qs";

const createQuestionaire = async (req: Request, res: NextApiResponse) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const payload: IUserAnswerRequest = await req.json();
  const result = await userMediaService.submitQuestionaires(token, payload);
  if (!result) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  return handleResponse(result, StatusCodeEnum.OK);
}


const transformUrl = (data: any): any => ({
  id: data.id
});

const getQuestionaireAnswer = async (req: Request, res: NextApiResponse) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const rawParams = req.url?.split("?")[1] || "";
  const requestData = transformUrl(qs.parse(rawParams));

  const result = await userMediaService.getUserMediaAnswer(token, requestData.id);
  if (!result) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  return handleResponse(result, StatusCodeEnum.OK);
}


export { createQuestionaire as POST, getQuestionaireAnswer as GET  };