import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { auth0Verify } from "@services/auth0.service";
import { accountService } from "@services/index";

const verifyHandler = async (req: Request) => {
  const { code, email = "", sms = "" } = await req.json();

  if (code && (email || sms)) {
    const token = await auth0Verify(code, email, sms);
    if (token?.id_token) {
      const {
        error,
        message,
        result: user
      } = await accountService.syncAccount(token.id_token);
      if (!error) {
        return handleResponse({ ...token, ...user }, StatusCodeEnum.OK);
      } else {
        return throwResponseError(message, StatusCodeEnum.BAD_REQUEST);
      }
    } else {
      return handleResponse(token, StatusCodeEnum.BAD_REQUEST);
    }
  } else{
    return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
  }
};

export { verifyHandler as POST };
