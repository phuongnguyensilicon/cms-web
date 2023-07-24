import { convertLogoPath, createDefaultWatchProvider, getBackgroundProvider } from "@/mapping/streamer-image.logo";
import { getThumbnailUrl } from "@/metadata/videos";
import { IUserMediaInfoStatus } from "@/model/account/userInfo";
import { redisService, metaDataService, mediaService, mediaTmdbSyncService } from "@/service";
import { handleResponse } from "@/utils/common.util";
import { HeaderKeyEnum, StatusCodeEnum, TMDBMediaTypeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";
import qs from "qs";

const transformRequest = (data: any): any => ({
  slug: data.slug
});

export async function POST(req: Request, res: NextApiResponse) {  
  const rawParams = req.url?.split("?")[1] || "";
  const requestData = transformRequest(qs.parse(rawParams));
  const slug = requestData?.slug;
  let results = await redisService.getMediaListNames();
  
  results = results.filter(x => x.active && (!slug || x.slug === slug));
  results.forEach(lstName => {
    lstName.mediaItems = lstName.mediaItems ?? [];
    lstName.mediaItems = lstName.mediaItems.filter(mediaItem => mediaItem.active);
  })

  let userStatuses: IUserMediaInfoStatus[] = [];
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (token) {
    let mediaItemIds = results.flatMap(x => x.mediaItems).map(x => x?.id ?? '');
    mediaItemIds = Array.from(new Set(mediaItemIds));

    userStatuses = await mediaService.getV2UserMediaStatuses(token, mediaItemIds);
  }

  results = results?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});

  const configuration = await metaDataService.getConfiguration();
  const allWatchProviders = await metaDataService.getStreamers();
  results.forEach(listName => {
    listName.mediaItems?.forEach(mediaItem => {
      if (mediaItem.watchProvider) {
        if (mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
          || mediaItem.mediaType === TMDBMediaTypeEnum.TV) {
          const watchProvider = allWatchProviders.filter(s => s.providerId === mediaItem.watchProvider?.providerId)[0];
          if (!watchProvider) {
            mediaItem.watchProvider = createDefaultWatchProvider(configuration);
          } else {
            mediaItem.watchProvider.logoPath = convertLogoPath(watchProvider.logoUpdatePath);
            mediaItem.watchProvider.bgColor = getBackgroundProvider(watchProvider.providerId);
          }
        }        
      } else {
        mediaItem.watchProvider = createDefaultWatchProvider(configuration);
      }

      if (token) {
        const status = userStatuses.filter(x => x.mediaItemId === mediaItem.id)[0];
        mediaItem.status = {
          isExistWatchList: status?.isExistWatchList ?? false,
          rate: status?.rate
        };
      }
    })
  })

  return handleResponse(results, StatusCodeEnum.OK);
}
