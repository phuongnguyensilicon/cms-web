import { gameService, questionaireService, userMediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";
import qs from "qs";

const transformUrl = (data: any): any => ({
  id: data.id
});

const getGenreSummary = async (req: Request, res: NextApiResponse) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const rawParams = req.url?.split("?")[1] || "";
  const requestData = transformUrl(qs.parse(rawParams));
  const results = await gameService.gameSummaryByGenre(token, requestData.id);
  if (!results) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  return handleResponse(results, StatusCodeEnum.OK);
}

export { getGenreSummary as GET };