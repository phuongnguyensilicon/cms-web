import { metaDataService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";

export async function GET() {
  const tags = await metaDataService.getMediaTags();
  const results = tags.map(x => x.name);
  
  return handleResponse(results, StatusCodeEnum.OK);
}
