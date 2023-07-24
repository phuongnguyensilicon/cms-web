import { IUpdateUserStreamerRequest } from "@/model/account/userInfo";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { accountService } from "@services/index";

const subscribleStreamers = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!!token) {
    const payload: IUpdateUserStreamerRequest = await req.json();
    const providerIds = payload?.providerIds ?? [];
    await accountService.subscribleStreamers(providerIds, token);
    return handleResponse(null, StatusCodeEnum.OK);
  } else {
    return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
  }
};

const getUserStreamers = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!!token) {
    const results = await accountService.getUserStreamers(token);
    return handleResponse(results, StatusCodeEnum.OK);
  } else {
    return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
  }
};

export { subscribleStreamers as POST, getUserStreamers as GET };
