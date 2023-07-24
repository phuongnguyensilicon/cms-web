import instance from "@/utils/api.util";
import { ERROR_CODE } from "@/utils/constant.util";
import { TMDBMediaTypeEnum } from "@/utils/enum";
import { IGetByTitleIdAndProviderNamePayload } from "@/utils/type";
import { IGetCastApiResponse } from "@/service/cast/cast.type";

class CastRepository {
  private _endpointMapping: { [key: string]: (tmdbId: number) => string } = {
    [TMDBMediaTypeEnum.MOVIE]: (tmdbId: number) => `/movie/${tmdbId}/credits`,
    [TMDBMediaTypeEnum.TV]: (tmdbId: number) => `/tv/${tmdbId}/credits`
  };

  public getByTitleId = async ({
    tmdbId,
    providerName
  }: IGetByTitleIdAndProviderNamePayload): Promise<IGetCastApiResponse> => {
    try {
      const endpoint = this._endpointMapping[providerName](tmdbId);
      const { data } = await instance.get<IGetCastApiResponse>(endpoint);
      return data;
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.CAST_NOT_FOUND);
    }
  };
}

const castRepository = new CastRepository();

export default castRepository;
