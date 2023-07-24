import { tagService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { tagValidator } from "@/validator";

export async function GET(_request: Request) {
  try {
    const tags = await tagService.getAll();
    return handleResponse(tags, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    tagValidator.validateAddTagPayload(payload);
    const tag = await tagService.addToDb(payload);
    return handleResponse(tag, StatusCodeEnum.CREATED);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
