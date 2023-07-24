import { metaDataService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";

export async function GET() {
  const configuration = await metaDataService.getGenres();
 
  return handleResponse(configuration, StatusCodeEnum.OK);
}
