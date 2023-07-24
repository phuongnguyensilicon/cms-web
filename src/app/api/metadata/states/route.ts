import { handleResponse, throwResponseError } from "@/utils/common.util";
import * as data from "@/metadata/us-state";
import { StatusCodeEnum } from "@/utils/enum";

export async function GET() {
  return handleResponse(data.states, StatusCodeEnum.OK);
}
