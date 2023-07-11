import appleTvSVG from '@svg/apple-tv.svg';
import disneySVG from '@svg/disney.svg';
import hboMaxSVG from '@svg/hbo-max.svg';
import huluSVG from '@svg/hulu.svg';
import netflixSVG from '@svg/netflix.svg';
import paramountSVG from '@svg/paramount.svg';
import primevideoSVG from '@svg/primevideo.svg';

export const DEFAULT_IMAGE_URL = '/images/default-image.jpg';
export const DATE_FORMAT = 'DD-MM-YYYY';
export const DATE_FORMAT_LL = 'MMMM D, YYYY';
export const DEFAULT_IMAGE_HEIGHT = 1000;
export const DEFAULT_IMAGE_WIDTH = 1000;
export const LIMIT_PER_PAGE = 20;

export const ERROR_CODE = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  TITLE_NOT_FOUND: 'TITLE_NOT_FOUND',
  WATCH_PROVIDER_NOT_FOUND: 'WATCH_PROVIDER_NOT_FOUND',
  VIDEO_DETAIL_NOT_FOUND: 'VIDEO_DETAIL_NOT_FOUND',
  VIDEO_NOT_FOUND: 'VIDEO_NOT_FOUND',
  TAG_NOT_FOUND: 'TAG_NOT_FOUND',
  CANNOT_CREATE_TITLE: 'CANNOT_CREATE_TITLE',
  CANNOT_CREATE_TITLE_METADATA: 'CANNOT_CREATE_TITLE_METADATA',
  CANNOT_CREATE_TAG: 'CANNOT_CREATE_TAG',
  CAST_NOT_FOUND: 'CAST_NOT_FOUND'
};

export const ERROR = {
  NOT_AUTHORIZED: 'Not Authorized',
  AN_ERROR_OCCURRED: 'An error occurred'
};

export const ERROR_DATE = {
  INVALID: 'Invalid date',
  FEATURE_DATE_AGE: 'Invalid for feature date',
  OVER_100_AGE: 'Invalid for over 100 years old'
};

export const STREAMERS = [
  {
    providerName: 'hulu',
    providerId: 15,
    logoPath: huluSVG,
    isSelected: false
  },
  {
    providerName: 'netflix',
    providerId: 8,
    logoPath: netflixSVG,
    isSelected: false
  },
  {
    providerName: 'disney',
    providerId: 337,
    logoPath: disneySVG,
    isSelected: false
  },
  {
    providerName: 'paramount',
    providerId: 531,
    logoPath: paramountSVG,
    isSelected: false
  },
  {
    providerName: 'primevideo',
    providerId: 9,
    logoPath: primevideoSVG,
    isSelected: false
  },
  {
    providerName: 'apple-tv',
    providerId: 2,
    logoPath: appleTvSVG,
    isSelected: false
  },
  {
    providerName: 'hbo-max',
    providerId: 384,
    logoPath: hboMaxSVG,
    isSelected: false
  }
];

export const STREAMER_IDS = STREAMERS.map(x => x.providerId);

export const RATING_OPTIONS: any[] = [
  {
    id: 'deb12c8e-251a-4a27-b028-7e3e1150d3fb',
    isWatched: false,
    isLiked: true,
    value: ["Haven't Seen", 'Would Watch'],
    active: false,
    icon: '/images/reactionsIcon/WouldWatch'
  },
  {
    id: 'fb431fee-9ca5-46fb-af67-0406037fd2d6',
    isWatched: false,
    isLiked: false,
    value: ["Haven't Seen", "Wouldn't Watch"],
    active: false,
    icon: '/images/reactionsIcon/WouldntWatch'
  },
  {
    id: '1c2ba3f2-e584-428f-95ea-b5377864e8d0',
    isWatched: true,
    isLiked: true,
    value: ['Watched It', 'Liked'],
    active: false,
    icon: '/images/reactionsIcon/Liked'
  },
  {
    id: '313270ab-7e08-4dc0-904b-e1aecadc2498',
    isWatched: true,
    isLiked: false,
    value: ['Watched It', "Didn't Like"],
    active: false,
    icon: '/images/reactionsIcon/DidntLike'
  }
];

export const REACTIONS: any[] = [
  {
    isWatched: false,
    isLiked: true,
    icon: '/images/reactionsIcon/WouldWatch'
  },
  {
    isWatched: false,
    isLiked: false,
    icon: '/images/reactionsIcon/WouldntWatch'
  },
  {
    isWatched: true,
    isLiked: true,
    icon: '/images/reactionsIcon/Liked'
  },
  {
    isWatched: true,
    isLiked: false,
    icon: '/images/reactionsIcon/DidntLike'
  }
];
