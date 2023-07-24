import { ISetContestWinnerRequest } from "@/model/contests/contest";
import { contestService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function POST(request: Request) {  
  try {  
    const payload: ISetContestWinnerRequest = await request.json();

    const result = await contestService.setContestWinners(payload.winnerUserId);
    
    if (result.error) {
      return throwResponseError(result.error);
    }

    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
