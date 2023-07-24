import { titleMetadataService } from "@/service";
import { IGetTitleParams } from "@/utils/type";
import { handleResponse, throwResponseError } from "@/utils/common.util";

export async function GET(
  _request: Request,
  { params: { titleId } }: IGetTitleParams
) {
  try {
    const metadata = await titleMetadataService.getByTitleId(titleId);
    return handleResponse(metadata);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
