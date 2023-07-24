import { IUpdateUserParams } from "@/model/account/userInfo";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { accountService } from "@services/index";

const updateUser = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (token) {
    const payload: IUpdateUserParams = await req.json();
    const { error, message, result } = await accountService.updateUser(
      payload,
      token
    );

    if (!error) {
      return handleResponse(result, StatusCodeEnum.OK);
    } else {
      return throwResponseError(message, StatusCodeEnum.BAD_REQUEST);
    }
  } else {
    return throwResponseError(
      ERROR_MESSAGE.INVALID_AUTHENTICATION,
      StatusCodeEnum.UNAUTHORIZED
    );
  }
};

export { updateUser as POST };
