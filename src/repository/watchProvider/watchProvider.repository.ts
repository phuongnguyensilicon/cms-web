import instance from "@/utils/api.util";
import { ERROR_CODE } from "@/utils/constant.util";
import { TMDBMediaTypeEnum } from "@/utils/enum";
import { IWatchProviderApiResponse } from "@/service/watchProvider/watchProvider.type";
import { IGetByTitleIdAndProviderNamePayload } from "@/utils/type";

class WatchProviderRepository {
  private _endpointMapping: { [key: string]: (tmdbId: number) => string } = {
    [TMDBMediaTypeEnum.MOVIE]: (tmdbId: number) =>
      `/movie/${tmdbId}/watch/providers`,
    [TMDBMediaTypeEnum.TV]: (tmdbId: number) => `/tv/${tmdbId}/watch/providers`
  };

  public getByTitleId = async ({
    tmdbId,
    providerName
  }: IGetByTitleIdAndProviderNamePayload): Promise<IWatchProviderApiResponse> => {
    try {
      const endpoint = this._endpointMapping[providerName](tmdbId);
      const { data } = await instance.get<IWatchProviderApiResponse>(endpoint);

      return data;
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.WATCH_PROVIDER_NOT_FOUND);
    }
  };
}

const watchProviderRepository = new WatchProviderRepository();

export default watchProviderRepository;
