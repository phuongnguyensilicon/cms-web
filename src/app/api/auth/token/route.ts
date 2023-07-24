import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { auth0Token } from "@services/auth0.service";
import { accountService } from "@services/index";

const tokenHandler = async (req: Request) => {
  const { code = "" } = await req.json();

  const token = await auth0Token(code.toString());
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
  }
};

export { tokenHandler as POST };
