import { convertStreamerLogo } from "@/mapping/streamer-image.logo";
import { IRedisStreamer } from "@/model/metadata/streamers";
import { metaDataService } from "@/service";
import { handleResponse, isAbsolutePath, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum, TMDBSizeEnum } from "@/utils/enum";

export async function GET() {
  let results = await metaDataService.getStreamers();
  results = results.sort((a: IRedisStreamer, b: IRedisStreamer) => a.providerName > b.providerName ? 1 : -1);
  const configuration = await metaDataService.getConfiguration();


  results.forEach(item => {
    item.logoPath = isAbsolutePath(item.logoPath) 
      ? item.logoPath
      : `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.logoPath}`;
  })

  return handleResponse(results, StatusCodeEnum.OK);
}
