import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { accountService } from "@services/index";

const getUserStats = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }

  const result = await accountService.getUserStats(token);

  return handleResponse({ ...result }, StatusCodeEnum.OK);
};

export { getUserStats as GET };
