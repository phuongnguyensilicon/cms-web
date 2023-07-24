import { gameService, questionaireService, userMediaService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";

const getGameStatistic = async (req: Request, res: NextApiResponse) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  const results = await gameService.gameStats(token ?? undefined);
  return handleResponse(results, StatusCodeEnum.OK);
}

export { getGameStatistic as GET };