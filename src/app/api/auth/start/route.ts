import { handleResponse } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { auth0Start } from "@services/auth0.service";

const startHandler = async (req: Request) => {
  const { email = "", sms = "", state = "" } = await req.json();
  if (email || sms) {
    const result = await auth0Start(email, sms, state);
    return handleResponse(result, StatusCodeEnum.OK);
  } else {
    return handleResponse(null, StatusCodeEnum.BAD_REQUEST);
  }
};

export { startHandler as POST };
