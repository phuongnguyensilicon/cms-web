import { titleMetadataService, titleService } from "@/service";
import { IGetTitleParams } from "@/utils/type";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { IUpdateTitlePayload } from "@/service/title/title.type";
import { titleValidator } from "@/validator";

export async function GET(
  _request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const title = await titleService.getById(titleId);
    const metadata = await titleMetadataService.getByTitleId(titleId);

    return handleResponse({ ...title, metadata });
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function PATCH(
  request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const payload = (await request.json()) as IUpdateTitlePayload;
    titleValidator.validateUpdateTitlePayload(payload);
    const updated = await titleService.updateById(titleId, payload);

    return handleResponse(updated);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function DELETE(
  _request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    await titleService.removeById(titleId);

    return handleResponse();
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
