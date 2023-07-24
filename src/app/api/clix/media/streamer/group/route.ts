import { convertLogoPath, convertStreamerLogo, getBackgroundProvider } from "@/mapping/streamer-image.logo";
import { mediaService, metaDataService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";
import qs from "qs";


const transformUrl = (data: any): any => ({
  id: data.id,
  mediaItemId: data.mediaItemId
});


export async function POST(req: Request) {
  try {       
    const rawParams = req.url?.split("?")[1] || "";
    const requestData = transformUrl(qs.parse(rawParams));
    
    if (!requestData.id) {
      return throwResponseError("Id Invalid", StatusCodeEnum.BAD_REQUEST);
    }

    const idNumber = Number(requestData.id);
    if (!idNumber) {
      return throwResponseError("Id Invalid", StatusCodeEnum.BAD_REQUEST);
    }

    let result = await mediaService.getMediaGroupsByProviderId(idNumber, requestData.mediaItemId);
    if (result.provider) {
      const configuration = await metaDataService.getConfiguration();
      result.provider.bgColor = getBackgroundProvider(result.provider?.providerId ?? 0);
      result.provider.logoPath = convertStreamerLogo(result.provider.logoPath, result.provider?.providerId ?? 0, configuration);
    }
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}