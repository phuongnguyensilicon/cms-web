import { IUserMediaStatus } from "../account/userInfo";
import { IMediaScoreInfo } from "../media/media";

export interface IRedisMediaListNameInfo {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  mediaItems?: IRedisMediaItemInfo[];
  displayOrder: number;
  slug?: string;
}

export interface IMediaRecommendationInfo {
  mediaItem: IRedisMediaItemInfo;
  recomendations: IRedisMediaItemInfo[];
}
export interface IRedisMediaItemInfo {
  id: string;
  active: boolean;
  name: string;
  mediaType: string;
  posterPath: string;
  backdropPath: string;
  genres?: string[];
  genre: string;
  watchProvider?: IRedisMediaWatchProviderInfo;
  videos: IRedisMediaAdditionalInfo[];
  status?: IUserMediaStatus;
  score: IMediaScoreInfo;
  clixScore?: number;
  ads3rdUrl: string;
  customReleaseDate?: Date;
}


export interface IRedisGroupMedias {
  provider?: IRedisMediaWatchProviderInfo;
  groups: IRedisGenreGroupMediaItem[];
}

export interface IRedisGenreGroupMediaItem {
  genre: string;
  items: IRedisMediaItemInfo[];
}


export interface IRedisMediaAdditionalInfo {
  name: string;
  key: string;
  site: string;
  source: string;
  displayOrder?: number;
  thumbnailUrl?: string;
  type: string;
}


export interface IRedisMediaWatchProviderInfo {
  logoPath: string;
  bgColor: string;
  providerName: string;
  providerId: number;
  isSelected: boolean;
  link: string;
}