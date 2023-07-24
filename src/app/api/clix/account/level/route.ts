import { accountLevels } from "@/metadata/level";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { accountService } from "@services/index";

const getUserLevel = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }


  let result = await accountService.getUserLevel(token);
  if (!result) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  return handleResponse(result, StatusCodeEnum.OK);
};

export { getUserLevel as GET };
