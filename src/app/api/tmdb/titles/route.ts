import qs from "qs";
import { ISearchMultiPayload } from "@/service/title/title.type";
import { titleRepository } from "@/repository";
import { titleService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { tmdbValidator } from "@/validator";

export async function GET(request: Request) {
  try {
    const rawParams = request.url?.split("?")[1] || "";
    const querystring = qs.parse(rawParams) as unknown as ISearchMultiPayload;
    const data = await titleRepository.searchMultiFromTMDB(querystring);
    return handleResponse(data);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    tmdbValidator.validateImportTitlePayload(body);
    const data = await titleService.addToDB(body);
    return handleResponse(data);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
