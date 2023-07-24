import { IUpsertPromoAdsRequest } from "@/model/promo-ads/promoAds";
import { promoAdsService } from "@/service";
import { handleResponse, throwResponseError } from "@/utils/common.util";
import { StatusCodeEnum } from "@/utils/enum";


export async function PUT(request: Request) {  
  try {  
    const payload: IUpsertPromoAdsRequest = await request.json();

    const result = await promoAdsService.upsertPromoAds(payload);
    
    return handleResponse(result, StatusCodeEnum.OK);
  } catch (error: unknown) {
    return throwResponseError((error as Error).message);
  }
}
