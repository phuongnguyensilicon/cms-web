import { IUpdateUserStreamerRequest, IUpdateWatchList } from "@/model/account/userInfo";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum, TMDBSizeEnum } from "@/utils/enum";
import { accountService, mediaService, metaDataService } from "@services/index";

const upsert = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const payload: IUpdateWatchList = await req.json();
  await mediaService.upsertWatchList(token, payload.id, payload.isAddToWatchList);

  return handleResponse(null, StatusCodeEnum.OK);
};

const getWatchList = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const results = await mediaService.getUserMediaWatchList(token);

  return handleResponse(results, StatusCodeEnum.OK);
};



export { upsert as POST, getWatchList as GET };
