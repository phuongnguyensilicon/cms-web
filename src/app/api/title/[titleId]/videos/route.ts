import { titleService, videoService } from "@/service";
import { IGetTitleParams } from "@/utils/type";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { videoValidator } from "@/validator";

export async function GET(
  _request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const videos = await videoService.getsByTitleId(titleId);
    return handleResponse(videos, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function POST(
  request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const { values } = await request.json();
    videoValidator.validateAddMultiVideosPayload(values);
    await titleService.getById(titleId);
    await videoService.addsToDb(
      (values as { name: string; value: string }[]).map(({ name, value }) => ({
        name,
        value,
        titleId
      }))
    );

    return handleResponse(null, StatusCodeEnum.CREATED);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
