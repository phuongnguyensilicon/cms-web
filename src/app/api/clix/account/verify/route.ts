import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { parseJwtTokenAuth0 } from "@/utils/jwt.utils";
import { auth0Verify } from "@services/auth0.service";
import { accountService } from "@services/index";

const verifyHandler = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  
  const { code, email = "", sms = "" } = await req.json();

  if (code && (email || sms)) {
    const isValid = await accountService.checkEmailPhoneUpdateValid(token, sms, email);
    if (!isValid)  {
      const error = sms ? ERROR_MESSAGE.ACCOUNT_PHONE_TAKEN : ERROR_MESSAGE.ACCOUNT_EMAIL_TAKEN ;
      return throwResponseError(error, StatusCodeEnum.BAD_REQUEST);
    }
    
    const newToken = await auth0Verify(code, email, sms);
    const { payload } = await parseJwtTokenAuth0(newToken?.id_token);
    if (!payload?.email && !payload?.phone_number) {
      return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
    }
    if (newToken?.id_token) {
      const {
        error,
        message,
        user
      } = await accountService.updatePhoneEmail(token, sms, email, payload);
      if (!error) {
        return handleResponse({ ...user }, StatusCodeEnum.OK);
      } else {
        return throwResponseError(message, StatusCodeEnum.BAD_REQUEST);
      }
    } else {
      return handleResponse(newToken, StatusCodeEnum.BAD_REQUEST);
    }
  } else{
    return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
  }
};

export { verifyHandler as POST };
