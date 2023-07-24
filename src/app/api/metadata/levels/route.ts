import { handleResponse, throwResponseError } from "@/utils/common.util";
import * as data from "@/metadata/us-state";
import { StatusCodeEnum } from "@/utils/enum";
import { accountLevels } from "@/metadata/level";

export async function GET() {
  return handleResponse(accountLevels(), StatusCodeEnum.OK);
}
