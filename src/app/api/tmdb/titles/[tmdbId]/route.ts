import { NextRequest, NextResponse } from "next/server";
import { titleService } from "@/service";
import { IGetTmdbTitleParams } from "@/utils/type";
import { ERROR_CODE } from "@/utils/constant.util";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import { titleRepository } from "@/repository";

export async function GET(
  _request: NextRequest,
  { params: { tmdbId } }: IGetTmdbTitleParams
) {
  try {
    const parsedTmdbId = Number(tmdbId);
    const titles = await titleService.getsByTmdbIds([parsedTmdbId]);
    if (!titles.length) {
      return throwResponseError(
        ERROR_CODE.TITLE_NOT_FOUND,
        StatusCodeEnum.BAD_REQUEST
      );
    }
    const [
      {
        provider: { id: providerId, name }
      }
    ] = titles;
    const result = await titleRepository.getById({
      tmdbId: parsedTmdbId,
      providerName: name
    });
    return handleResponse(result);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
