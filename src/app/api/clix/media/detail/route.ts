import { mediaService, metaDataService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { IGetMediaDetailRequest, IMediaShortInfo, IUserMediaInfo } from "@/model/media/media";
import qs from "qs";
import { HeaderKeyEnum, MediaDetailSourceEnum, StatusCodeEnum } from "@/utils/enum";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { convertLogoPath, createDefaultWatchProvider, getBackgroundProvider } from "@/mapping/streamer-image.logo";

const transformUrl = (data: any): any => ({
  id: data.id
});

const DEFAULT_CAST_SIZE = 10;

export async function GET(req: Request) {
  try {
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformUrl(qs.parse(rawParams));
    const mediaInfo = await mediaService.getMediaDetail(requestData.id, true);
    if (!mediaInfo) {
      return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
    }
    
    //mediaInfo.casts = (mediaInfo.casts ?? []).splice(0, DEFAULT_CAST_SIZE);

    const configuration = await metaDataService.getConfiguration();
    const allWatchProviders = await metaDataService.getStreamers();
    const defaultProvider = createDefaultWatchProvider(configuration);
    if (!mediaInfo.watchProviders?.length) {
      mediaInfo.watchProvider = defaultProvider;
    } else {
      let watchProviderDb = mediaInfo.watchProviders.filter(x => x.isSelected)[0];
      if (!watchProviderDb) {
        watchProviderDb = mediaInfo.watchProviders[0];
      }
      const watchProvider = allWatchProviders.filter(s => s.providerId === watchProviderDb?.providerId)[0];
        if (!watchProvider) {
          mediaInfo.watchProvider = defaultProvider;
        } else {
          mediaInfo.watchProvider = {
            logoPath: convertLogoPath(watchProvider.logoUpdatePath),
            providerId: watchProviderDb.providerId ?? 0,
            providerName: watchProviderDb.providerName,
            isSelected: watchProviderDb.isSelected ?? false,
            bgColor: getBackgroundProvider(watchProviderDb.providerId ?? 0),
            link: watchProviderDb.link ?? ''
          };
        }
    }

    if (mediaInfo.watchProviders?.length) {
      mediaInfo.watchProviders.forEach(provider => {
        const watchProvider = allWatchProviders.filter(s => s.providerId === provider.providerId)[0];
        if (!watchProvider) {
          provider = {
            link: provider.link,
            logoPath: defaultProvider.logoPath,
            providerId: provider.providerId,
            providerName: provider.providerName,
            isSelected: provider.isSelected,
            id: provider.id
          };
        } else {
          provider.logoPath = convertLogoPath(watchProvider.logoUpdatePath);
        }
      })
    }

    const result: IUserMediaInfo = {
      info: mediaInfo,
    };
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    if (!token) {
      return handleResponse(result);
    }

    const userMediaStatus = await mediaService.getUserMediaStatusByToken(token, requestData.id);
    if (userMediaStatus) {
      result.status = userMediaStatus;
    }
    return handleResponse(result);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
