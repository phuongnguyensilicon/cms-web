import { IUserMediaGameStatus, IUserMediaStatus } from "../account/userInfo";
import { IRedisMediaWatchProviderInfo } from "../redis/redis-media-list.name";

export interface IMediaShortInfo {
  id?: string;
  name: string;
  overview: string;
  releaseDate?: Date;
  tmdbId: number;
  mediaType: string;
  posterPath: string;
  backdropPath: string;
  voteAverage?: number;
  voteAveragePercent?: string;
  runtime?: number;
  numberEpisodes?: number;
  numberSeasons?: number;
  tags?: string[];
  genres?: string[];
  genre?: string;
  casts?: IMediaCastInfo[];
  videos?: IMediaAdditionalInfo[];
  watchProviders?: IMediaWatchProviderInfo[];
  watchProvider?: IRedisMediaWatchProviderInfo;
  directors?: IMediaCastInfo[];
  certification?: string;
  active: boolean;
  score: IMediaScoreInfo;
  clixScore?: number;
  ads3rdUrl?: string;
  createdAt: Date;
  customReleaseDate?: Date;
  hasTmdbChange?: boolean;
  isReadLog?: boolean;
}


export interface IUserMediaInfo {
  status?: IUserMediaStatus;
  info: IMediaShortInfo;
}

export interface IUserGenreGameDataInfo {
  genre: IUserGenreInfo;
  titles: IUserMediaGameInfo[];
}

export interface IUserGenreInfo {
  id: string;
  name: string;
  total: number;
  totalComplete: number;
}

export interface IUserMediaGameInfo {
  status?: IUserMediaGameStatus;
  info: IMediaShortInfo;
}

export interface IImportMediaRequest {
  type: string;
  tmdbIds: number[];
}

export interface IMediaWatchProviderInfo {
  id: string;
  logoPath: string;
  providerId: number | null
  providerName: string
  link: string | null;
  isSelected: boolean;
}

export interface IMediaAdditionalInfo {
  name: string;
  key: string;
  site: string;
  active: boolean;
  source: string;
  displayOrder?: number;
  thumbnailUrl?: string;
  mostPopular: boolean;
  isSelected?: boolean;
  type?: string;
}

export interface IMediaCastInfo {
  adult: boolean;
  knownDepartment: string;
  name: string;
  gender: number;
  profilePath:  string | null;
}

export interface IUpdateVisibilityMediaRequest {
  mediaItemId: string;
  isVisibility: boolean;
}


export interface IGetMediaDetailRequest {
  mediaItemId: string;
  source?: string;
}


export interface IUpdateMediaRequest {
  id: string;
  posterPath?: string;
  overview?: string;
  name?: string;
  tags?: string[];
  additionalVideos?: IMediaAdditionalRequest[];
  selectedGenre?: string;
  providers?: IUpdateProviderRequest[];
  customReleaseDate?: string;
  ///remove later
  customProviderIds?: number[];
  selectedProviderId?: number;
}

export interface IUpdateProviderRequest {
  id: number;
  link?: string;
  isSelected: boolean;
}

export interface IUpdateMediaStreamerRequest {
  id: string;
  selectedProviderId: number;
}

export interface IMediaAdditionalRequest {
  name: string;
  key: string;
  site?: string;
  active: boolean;
  source: string;
  isSelected?: boolean;
}

export interface IMediaScoreInfo {
  ads: number;
  rate: number;
  select: number;
  game: number;
}

export interface IUpdateGameGenreMediaRequest {
  id: string;
  mediaItemId: string;
}

export interface ICompareTitleStatus {
  mediaItemId: string;
  diffChanges: ICompareTitleFieldStatus[];
}

export interface ICompareTitleFieldStatus {
  field: string;
  oldValue?: string;
  newValue?: string
}

export interface IUpdateReadLogTitle {
  id: string;
}
