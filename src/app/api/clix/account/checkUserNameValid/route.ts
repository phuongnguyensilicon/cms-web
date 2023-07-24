import { handleResponse, throwResponseError } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";
import { accountService } from "@services/index";

const checkUserNameValid = async (req: Request) => {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError("", StatusCodeEnum.BAD_REQUEST);
  }

  const { userName } = await req.json();

  const isValid = await accountService.checkUserNameValid(token, userName);

  return handleResponse({ isValid }, StatusCodeEnum.OK);
};

export { checkUserNameValid as POST };
