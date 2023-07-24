import { handleResponse } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { auth0Start } from "@services/auth0.service";
import { accountService } from "@services/index";

const signupHandler = async (req: Request) => {
  const { email = "", sms = "", state = "" } = await req.json();
  if (email || sms) {
    const result = await auth0Start(email, sms, state);
    const user = await accountService.checkUserExisting(email, sms);
    return handleResponse({ ...result, user }, StatusCodeEnum.OK);
  } else {
    return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
  }
};

export { signupHandler as POST };
