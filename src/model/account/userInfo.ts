import { IUserMediaStatInfo } from "../questionaire/questionaire";

export interface IUserInfo {
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
  dob?: Date;
  city?: string;
  state?: string;
  gender?: string;
}

export interface IUpdateUserParams {
  userName?: string;
  dob?: Date;
  city?: string;
  state?: string;
  gender?: string;
  avatar?: string;
  picture?: string;
}

export interface IUpdateUserStreamerRequest {
  providerIds?: number[];
}

export interface IUserMediaStatus {
  // isRate: boolean;  
  rate?: IUserMediaStatInfo;
  isExistWatchList: boolean;
}

export interface IUserMediaGameStatus extends IUserMediaStatus{
  isCompleteGame: boolean;
}

export interface IUserMediaInfoStatus extends IUserMediaStatus {
  mediaItemId: string;
}

export interface IUpdateWatchList {
  id: string;
  isAddToWatchList: boolean;
}

export interface IUserFeedbackRequest {
  content: string;
}

export interface IUserStatsResponse {
  totalLike: number;
  totalDislike: number;
  totalWatchlist: number;
  totalDiscountClaim: number;
}

export interface IUserRewardInfo {
  id: string;
  userName: string;
  email?: string;
  giftCardType?: string;
  totalPoints?: number;
  redeemDate?: Date;
  isRedeem: boolean;
}

