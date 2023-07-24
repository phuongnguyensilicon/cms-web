import { watchProviderRepository } from "@/repository";
import { ERROR_CODE } from "@/utils/constant.util";
import providerService from "../provider/provider.service";
import {
  IGetWatchProviderByTitleIdPayload,
  IWatchProviderApiResponse,
  IWatchProviderItemResponse,
  IWatchProviderResponse,
  IWatchProviderSubItemApiResponse,
  IWatchProviderSubItemResponse
} from "./watchProvider.type";

class WatchProviderService {
  private _transformItem = (
    data: IWatchProviderSubItemApiResponse
  ): IWatchProviderSubItemResponse => ({
    displayPriority: data.display_priority,
    logoPath: data.logo_path,
    providerId: data.provider_id,
    providerName: data.provider_name
  });

  private _transformData = ({
    id,
    results
  }: IWatchProviderApiResponse): IWatchProviderResponse => {
    const updatedResults: {
      [key: string]: IWatchProviderItemResponse;
    } = {};
    Object.keys(results).forEach(key => {
      const { link, flatrate = [], buy = [], rent = [] } = results[key];
      updatedResults[key] = {
        link,
        flatrate: flatrate.map(this._transformItem),
        buy: buy.map(this._transformItem),
        rent: rent.map(this._transformItem)
      };
    });
    return { id, results: updatedResults };
  };

  public getByTitleId = async ({
    tmdbId,
    providerId
  }: IGetWatchProviderByTitleIdPayload): Promise<IWatchProviderResponse> => {
    try {
      const { name } = await providerService.getById(providerId);
      const watchProvider = await watchProviderRepository.getByTitleId({
        tmdbId,
        providerName: name
      });

      return this._transformData(watchProvider);
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.WATCH_PROVIDER_NOT_FOUND);
    }
  };
}

const watchProviderService = new WatchProviderService();

export default watchProviderService;
