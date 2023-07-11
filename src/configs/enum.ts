export enum TMDBMediaTypeEnum {
  MOVIE = 'movie',
  TV = 'tv',
  PERSON = 'person',
  IMPORTED = 'imported'
}

export enum TMDBSizeEnum {
  W300 = 'w300',
  ORIGINAL = 'original'
}

export enum TMDBAdditionalSiteEnum {
  CLIX = 'Clix'
}

export enum TMDBCreditEnum {
  CAST = 'cast',
  CREW = 'crew'
}

export enum TMDBCreditJobEnum {
  DIRECTOR = 'Director',
  CLIX_CUSTOM_DIRECTOR = 'Clix_Custom_Director'
}

export enum MediaDetailSourceEnum {
  CLIX = 'Clix',
  TMDB = 'Tmdb'
}

export enum TMDBWatchProvider {
  US = 'US'
}

export enum TMDBVideoDetailStatusEnum {
  RUMORED = 'Rumored',
  PLANNED = 'Planned',
  IN_PRODUCTION = 'In Production',
  POST_PRODUCTION = 'Post Production',
  RELEASED = 'Released',
  CANCELED = 'Canceled'
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
