import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { auth0Start } from "@services/auth0.service";
import { accountService } from "@services/index";

const startHandler = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  
  const { email = "", sms = "", state = "" } = await req.json();

  const isValid = await accountService.checkEmailPhoneUpdateValid(token, sms, email);
  if (!isValid)  {
    const error = sms ? ERROR_MESSAGE.ACCOUNT_PHONE_TAKEN : ERROR_MESSAGE.ACCOUNT_EMAIL_TAKEN ;
    return throwResponseError(error, StatusCodeEnum.BAD_REQUEST);
  }

  if (email || sms) {
    const result = await auth0Start(email, sms, state);
    return handleResponse(result, StatusCodeEnum.OK);
  } else {
    return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
  }
};

export { startHandler as POST };
