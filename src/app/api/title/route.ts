import qs from "qs";
import { IGetTitlePayload } from "@/service/title/title.type";
import { titleService } from "@/service";
import { IListResponse } from "@/utils/type";
import { Title } from "@prisma/client";
import { handleResponse, throwResponseError } from "@/utils/common.util";

const transformGetTitleRequest = (data: any): IGetTitlePayload => ({
  offset: Number(data.offset),
  limit: Number(data.limit),
  query: data.query,
  tmdbIds: data.tmdbIds?.split(",").map((str: string) => Number(str)),
  includeMetadata: true
});

export async function GET(request: Request) {
  try {
    const rawParams = request.url?.split("?")[1] || "";
    const querystring = transformGetTitleRequest(qs.parse(rawParams));
    const { results, totalResults } = await titleService.getsByCondition(
      querystring
    );
    return handleResponse<IListResponse<Title>>({
      total: totalResults,
      items: results
    });
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
