import { watchProviderService, titleService } from "@/service";
import { IGetTitleParams } from "@/utils/type";
import { handleResponse, throwResponseError } from "@/utils/common.util";

export async function GET(
  _request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const { providerId, tmdbId } = await titleService.getById(titleId);
    const result = await watchProviderService.getByTitleId({
      tmdbId,
      providerId
    });
    return handleResponse(result);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
