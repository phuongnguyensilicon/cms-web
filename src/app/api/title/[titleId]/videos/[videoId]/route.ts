import { titleService, videoService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { videoValidator } from "@/validator";

interface IVideoDetailParams {
  params: { titleId: string; videoId: string };
}

export async function GET(
  _request: Request,
  { params: { titleId, videoId } }: IVideoDetailParams
) {
  try {
    await titleService.getById(titleId);
    const video = await videoService.getById(videoId);
    return handleResponse(video, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function PATCH(
  request: Request,
  { params: { titleId, videoId } }: IVideoDetailParams
) {
  try {
    const payload = await request.json();
    videoValidator.validateUpdateVideoPayload(payload);
    await titleService.getById(titleId);
    const updated = await videoService.updateById(videoId, payload);
    return handleResponse(updated, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function DELETE(
  _request: Request,
  { params: { titleId, videoId } }: IVideoDetailParams
) {
  try {
    await titleService.getById(titleId);
    await videoService.removeById(videoId);
    // TODO: find ways to allow return status code 204
    return handleResponse(null, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
