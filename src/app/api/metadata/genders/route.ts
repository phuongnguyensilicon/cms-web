import { handleResponse, throwResponseError } from "@/utils/common.util";
import * as data from "@/metadata/gender";
import { StatusCodeEnum } from "@/utils/enum";

export async function GET() {
  return handleResponse(data.genders, StatusCodeEnum.OK);
}
