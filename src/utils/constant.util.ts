import { IMediaScoreInfo } from "@/model/media/media";

export const DEFAULT_IMAGE_URL = "/images/default-image.jpg";
export const DATE_FORMAT = "DD-MM-YYYY";
export const DATE_FORMAT_LL = "MMMM D, YYYY";
export const DEFAULT_IMAGE_HEIGHT = 1000;
export const DEFAULT_IMAGE_WIDTH = 1000;
export const LIMIT_PER_PAGE = 20;

export const ERROR_CODE = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND",
  TITLE_NOT_FOUND: "TITLE_NOT_FOUND",
  WATCH_PROVIDER_NOT_FOUND: "WATCH_PROVIDER_NOT_FOUND",
  VIDEO_DETAIL_NOT_FOUND: "VIDEO_DETAIL_NOT_FOUND",
  VIDEO_NOT_FOUND: "VIDEO_NOT_FOUND",
  TAG_NOT_FOUND: "TAG_NOT_FOUND",
  CANNOT_CREATE_TITLE: "CANNOT_CREATE_TITLE",
  CANNOT_CREATE_TITLE_METADATA: "CANNOT_CREATE_TITLE_METADATA",
  CANNOT_CREATE_TAG: "CANNOT_CREATE_TAG",
  CAST_NOT_FOUND: "CAST_NOT_FOUND"
};

export const ERROR_MESSAGE = {
  SUB_AUTH0_INVALID: "Invalid Sub-Auth0.",
  INVALID_AUTHENTICATION: "Invalid Authentication.",
  USER_PROVIDER_AUTH0_NOT_FOUND: "The user's provider was not found.",
  USER_MISS_PHONE_EMAIL: "Your account missing phone or email.",
  COMMON_ERROR:
    "There was an error processing your request. Please try again later...",
  ACCOUNT_USERNAME_TAKEN: "Your username is already taken.",
  ACCOUNT_USERNAME_INVALID: "Invalid Username.",
  ACCOUNT_EMAIL_TAKEN: "Your email is already taken.",
  ACCOUNT_PHONE_TAKEN: "Your phone is already taken.",
  CONTEST_TIX_VALUE_INVALID: "Invalid tix exchange.",
  CONTEST_TIX_POINT_INVALID: "Not enough points.",
  CONTEST_NOT_FOUND: "Not found contest.",
  CONTEST_EXISTED: "Contest existed.",
  USER_NOT_FOUND: "Not found user.",
  CONTEST_USER_NOT_FOUND_TIX: "Not found tix.",
  REQUEST_INVALID: "Request invalid.",
};

export const VIEW_ADS_TITLE_SCORE = 25;
export const SELECT_QUESTIONAIRE_SCORE = 5;
export const RATE_QUESTIONAIRE_SCORE = 20;
export const VIEW_GAME_TITLE_SCORE = 25;

export const SCORE_DEFAULT: IMediaScoreInfo = {
  ads: VIEW_ADS_TITLE_SCORE,
  rate: RATE_QUESTIONAIRE_SCORE,
  select: SELECT_QUESTIONAIRE_SCORE,
  game: VIEW_GAME_TITLE_SCORE
}

export const DEFAULT_ROUND_PRICE_WON = 1000;
export const DEFAULT_EXCHANGE_TIX_POINT = 5000;