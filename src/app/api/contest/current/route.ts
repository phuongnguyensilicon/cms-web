import { contestService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function GET(request: Request) {  
  try {  
    const result = await contestService.getCurrentContest();
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
