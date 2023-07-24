export enum TMDBMediaTypeEnum {
  MOVIE = "movie",
  TV = "tv",
  PERSON = "person",
  IMPORTED = "imported",
  PROMOS = "promos",
  ADS = "ads"
}

export enum TMDBSizeEnum {
  W300 = "w300",
  ORIGINAL = "original"
}

export enum TMDBAdditionalSiteEnum {
  CLIX = "Clix"
}

export enum TMDBCreditEnum {
  CAST = "cast",
  CREW = "crew"
}

export enum TMDBCreditJobEnum {
  DIRECTOR = "Director",
  CLIX_CUSTOM_DIRECTOR = "Clix_Custom_Director",
  WRITER = "Writer"
}

export enum MediaDetailSourceEnum {
  CLIX = "Clix",
  TMDB = "Tmdb"
}

export enum TMDBWatchProvider {
  US = "US"
}

export const DEFAULT_WATCH_PROVIDER_NAME = 'Clix';

export enum TMDBVideoDetailStatusEnum {
  RUMORED = "Rumored",
  PLANNED = "Planned",
  IN_PRODUCTION = "In Production",
  POST_PRODUCTION = "Post Production",
  RELEASED = "Released",
  CANCELED = "Canceled"
}

export enum StatusCodeEnum {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  MOVED_PERMANENTLY = 301,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  REQUEST_TIMEOUT = 408,
  GONE = 410,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503
}

export enum QuestionTypeEnum {
  MULTIPLE = "multiple"
}

export enum QuestionOptionTypeEnum {
  INPUT_INDICATOR = "input-indicator",
  INPUT_SELECT = "input-select"
}

export enum HeaderKeyEnum {
  AUTHORIZATION = "Authorization"
}

export enum EVENTS {
  SYNC_START_AUTH0 = "on-start-auth0",
  SYNC_VERIFY_AUTH0 = "on-verify-auth0",
  SYNC_PROFILE = "on-sync-profile",
  SYNC_AUTH0 = "on-sync-auth0"
}

export enum CMSEventEnum {
  SYNC_RECOMMENDATIONS = "on-sync-recommendations"
}


export enum UserGameStatus {
  PENDING = "pending",
  COMPLETE = "complete"
}

export enum ClixSearchType {
  TITLE = 'title',
  PROMO_ADS = 'promo_ads',
  ALL = 'All',
}


export enum TMDBAdditionalTypeEnum {
  TRAILER = "Trailer",
  CLIP = "Clip",
  TEASER = "Teaser"
}

export enum ClixTitleVideoType {
  TRAILER = "trailer",
  GAME = "game",
  DEFAULT = "default",
}

export enum CompareTitleFieldName {
  NAME = "name",
  STREAMERS = "streamers",
  RELEASE_DATE = "releaseDate",
  VOTE_AVERAGE = "voteAverage",
  CERTIFICATION = "certification",
  RUNTIME = "runtime",
  NUMBER_EPISODES = "numberEpisodes",
  NUMBER_SEASONS = "numberSeasons",
  GENRES = "genres",
}


export enum ContestStatus {
  COMPLETED = "completed",
  RUNNING = "running"
}