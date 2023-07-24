import { ICreateContestRequest, ICreateTixRequest, ISetContestWinnerRequest } from "@/model/contests/contest";
import { contestService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";


export async function POST(req: Request) {  
  try {  
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    if (!token) {
      return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
    }
    const payload: ICreateTixRequest = await req.json();
    const result = await contestService.createTixs(token, payload.totalTix);
    if (result.error) {
      return throwResponseError(result.error);
    }

    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
