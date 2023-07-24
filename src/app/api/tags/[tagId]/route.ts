import { tagService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { tagValidator } from "@/validator";

interface ITagDetailParams {
  params: { tagId: string };
}

export async function GET(
  _request: Request,
  { params: { tagId } }: ITagDetailParams
) {
  try {
    const tag = await tagService.getById(tagId);
    return handleResponse(tag, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function PATCH(
  request: Request,
  { params: { tagId } }: ITagDetailParams
) {
  try {
    const payload = await request.json();
    tagValidator.validateAddTagPayload(payload);
    await tagService.updateById(tagId, payload);
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function DELETE(
  _request: Request,
  { params: { tagId } }: ITagDetailParams
) {
  try {
    await tagService.removeById(tagId);
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
