export interface ICreateContestRequest {
  startDate: string;
  endDate: string;
}

export interface IContestSummary {
  startDate?: Date;
  totalPlayer?: number;
  prizeValue?: number;
  totalAllPastWinner: number;
  totalEntries?: number;
  pastWinners?: IContestWiner[];
}

export interface IContestWiner {
  userName: string;
  state: string;
  city: string;
}


export interface ICreateTixRequest {
  totalTix: number;
}

export interface ISetContestWinnerRequest {
  winnerUserId: string;
}

export interface IUserContestResponse {
  id: string;
  userName?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
  totalTix?: number;
  tixCreatedAt?: Date;
  lastWonDate?: Date;
}
