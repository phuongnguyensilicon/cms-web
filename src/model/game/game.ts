export interface IUserGameStatInfo {
  id: string;
  genre: string;
  totalPending?: bigint;
  total?: bigint;
  completePercentage?: bigint;
}

export interface IUserGameSummaryInfo {
  id: string;
  genre: string;
  totalScore?: bigint;
  highestMediaItem?: IUserMediaHighestInfo;
  nextGameInfo?: INextGameInfo;
}

export interface IUserMediaHighestInfo {
  id?: string;
  name?: string;
  totalPoint?: bigint;
}

export interface INextGameInfo {
  id?: string;
  name?: string;
}

export interface IUserGameDataSummaryInfo {
  id: string;
  genre: string;
  totalScore?: bigint;
  highestMediaItemId?: string;
  highestMediaItemTotalPoint?: bigint;
  highestMediaItemName: string;
}

