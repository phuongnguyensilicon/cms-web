import { convertLogoPath, createDefaultWatchProvider } from "@/mapping/streamer-image.logo";
import { redisService, metaDataService, mediaListNameService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { HeaderKeyEnum, StatusCodeEnum, TMDBSizeEnum } from "@/utils/enum";
import { NextApiResponse } from "next";

export async function GET(req: Request, res: NextApiResponse) {
  const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
  if (!token) {
    return throwResponseError(ERROR_MESSAGE.COMMON_ERROR, StatusCodeEnum.BAD_REQUEST);
  }
  
  let results = await mediaListNameService.getRedisListNameByToken(token);
  results = results?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});
  
  const configuration = await metaDataService.getConfiguration();
  const allWatchProviders = await metaDataService.getStreamers();
  results.forEach(listName => {
    listName.mediaItems?.forEach(mediaItem => {      
      if (mediaItem.watchProvider) {
        const watchProvider = allWatchProviders.filter(s => s.providerId === mediaItem.watchProvider?.providerId)[0];
        if (!watchProvider) {
          mediaItem.watchProvider = createDefaultWatchProvider(configuration);
        } else {
          mediaItem.watchProvider.logoPath = convertLogoPath(watchProvider.logoUpdatePath);
        }
      } else {
        mediaItem.watchProvider = createDefaultWatchProvider(configuration);
      }
    })
  })

  return handleResponse(results, StatusCodeEnum.OK);
}
