
export interface IQuestionaireInfo {
  id: string;
  isWatched: boolean;
  isLiked: boolean;
  questions: IQuestionInfo[];
}

export interface IUserMediaStatInfo {
  mediaItemId: string;
  questionaireSeleted?: IQuestionaireInfo;
  isWatchAds: boolean;
  isRateMedia: boolean;
  isWatchGame: boolean;
  isSelectQuestionare: boolean;
}

export interface IQuestionInfo {
  id: string;
  title: string;
  description: string;
  type: string;
  point?: number;
  subActions?: string[];
  options: IQuestionOption[];
}


export interface IQuestionOption {
  id: string;
  title: string;
  description: string;
  type: string;
  point?: number;
  isSelected?: boolean;
}


export interface IUserAnswerRequest {
  mediaItemId: string;
  questionaireInfo: IUserQuestionaireRequest;
}

export interface IUserQuestionaireRequest {
  id: string;
  questions?: IUserQuestionRequest[];
}

export interface IUserQuestionRequest {
  id: string;
  options: IUserQuestionOptionRequest[];
}

export interface IUserQuestionOptionRequest {
  id: string;
  point?: number;
}

export interface IBaseUserMediaRequest {
  mediaItemId: string;
}