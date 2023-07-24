import { ISetContestWinnerRequest } from "@/model/contests/contest";
import { contestService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum } from "@/utils/enum";


export async function POST(req: Request) {  
  try {  
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    const result = await contestService.getContestSummary(token ?? undefined);
    
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
