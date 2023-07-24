import { IMediaAdditionalRequest } from "../media/media";

export interface IUpsertPromoAdsRequest {
  id?: string;
  posterPath: string;
  overview?: string;
  name: string;
  additionalVideos?: IMediaAdditionalRequest[];
  ads3rdUrl?: string;
  watchProvider?: IUpdatePromotionalProviderRequest;
}


export interface IUpdatePromotionalProviderRequest {
  link?: string;
  logoPath: string;
}
