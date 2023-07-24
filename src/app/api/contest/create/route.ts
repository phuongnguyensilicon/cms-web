import { ICreateContestRequest } from "@/model/contests/contest";
import { contestService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function POST(request: Request) {  
  try {  
    const payload: ICreateContestRequest = await request.json();

    const result = await contestService.createContest(payload);
    if (result.error) {
      return throwResponseError(result.error);
    }

    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
