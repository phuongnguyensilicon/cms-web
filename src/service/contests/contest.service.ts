import { IBaseResponse, IRestReponse } from "@/model/common/tmdp-response";
import { IContestSummary, IContestWiner, ICreateContestRequest, IUserContestResponse } from "@/model/contests/contest";
import { accountService } from "@/service";
import { randomTixCode } from "@/utils/common.util";
import { DEFAULT_EXCHANGE_TIX_POINT, DEFAULT_ROUND_PRICE_WON, ERROR_MESSAGE } from "@/utils/constant.util";
import { ContestStatus } from "@/utils/enum";
import prisma from "@/utils/prisma.util";
import { Contest, ContestWonStat, User, UserTix } from "@prisma/client";
import { v4 } from "uuid";

class ContestService {
  private DEFAULT_PAGE_SIZE = 20;
  public createContest = async (request: ICreateContestRequest): Promise<IRestReponse<any>> => {
    const today = new Date();
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    if (startDate <= today || endDate <= today || startDate >= endDate) {
      return {
        error: ERROR_MESSAGE.REQUEST_INVALID
      };
    }
    let contest = await prisma.contest.findFirst({
      where: {
        status: ContestStatus.RUNNING
      }
    });

    if (contest) {
      return {
        error: ERROR_MESSAGE.CONTEST_EXISTED
      };
    }

    contest = {
      createdAt: new Date(),
      endDate: endDate,
      id: v4(),
      prizeValue: DEFAULT_ROUND_PRICE_WON,
      startDate: startDate,
      status: ContestStatus.RUNNING,
      updatedAt: new Date()
    };
    await prisma.contest.create({
      data: contest
    });
    return {};
  };

  public createTixs = async (token: string, totalCreateTix: number): Promise<IRestReponse<any>> => {
    if (totalCreateTix <= 0) {
      return {
        error: ERROR_MESSAGE.CONTEST_TIX_VALUE_INVALID
      };
    }
    const provider = await accountService.getUserProviderByToken(token); 
    if (!provider?.userId) {
      return {
        error: ERROR_MESSAGE.INVALID_AUTHENTICATION
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: provider.userId
      }
    });
    if (!user?.email || !user?.phone) {
      return {
        error: ERROR_MESSAGE.USER_MISS_PHONE_EMAIL
      };
    }

    const totalPoints = await prisma.userScoreStat.findFirst({
      where: {
        userId: provider.userId
      }
    });

    if (!totalPoints?.totalPoint) {
      return {
        error: ERROR_MESSAGE.CONTEST_TIX_POINT_INVALID
      };
    }

    const remainPoints = totalPoints.totalPoint - (totalPoints.totalUsedPoint ?? 0);
    const totalExchangePoints = DEFAULT_EXCHANGE_TIX_POINT * totalCreateTix;
    if (remainPoints < totalExchangePoints) {
      return {
        error: ERROR_MESSAGE.CONTEST_TIX_POINT_INVALID
      };
    }

    const contest = await this.getCurrentContestInfo();
    if (!contest) {
      return {
        error: ERROR_MESSAGE.CONTEST_NOT_FOUND
      };
    }
    await this.createUserTixs(contest.id, provider.userId, totalCreateTix);
    const totalUsedPoints = (totalPoints.totalUsedPoint ?? 0) + totalExchangePoints;
    await prisma.userScoreStat.update({
      where: {
        userId: provider.userId
      },
      data: {
        updatedAt: new Date(),
        totalUsedPoint: totalUsedPoints
      }
    });
    return {};
  };

  public setContestWinners = async (winnerUserId: string): Promise<IRestReponse<any>> => {
    const contest = await this.getCurrentContestInfo();
    if (!contest) {
      return {
        error: ERROR_MESSAGE.CONTEST_NOT_FOUND
      };
    }
    const winnerUser = await prisma.user.findFirst({
      where: {
        id: winnerUserId
      }
    });
    if (!winnerUser) {
      return {
        error: ERROR_MESSAGE.USER_NOT_FOUND
      };
    }

    const lastUserTix = await prisma.userTix.findFirst({
      where: {
        userId: winnerUserId,
        contestId: contest.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!lastUserTix) {
      return {
        error: ERROR_MESSAGE.CONTEST_USER_NOT_FOUND_TIX
      };
    }

    const winnerContest: ContestWonStat = {
      contestId: contest.id,
      createdAt: new Date(),
      id: v4(),
      updatedAt: new Date(),
      userTixId: lastUserTix.id,
    };
    
    await prisma.contestWonStat.create({
      data: winnerContest
    });

    await prisma.contest.update({
      where: {
        id: contest.id
      },
      data: {
        updatedAt: new Date(),
        status: ContestStatus.COMPLETED
      }
    });
    return {};
  };

  public getCurrentContest = async (): Promise<any> => {
    const contest = await this.getCurrentContestInfo();
    if (!contest) {
      return undefined;
    }
    return {
      id: contest.id,
      startDate: contest.startDate,
      endDate: contest.endDate
    };
  };
  
  public getContestSummary = async (token?: string): Promise<IContestSummary> => {
    const [contest, winners] = await Promise.all([
      this.getCurrentContestInfo(),
      this.getUserWinners()
    ]);
    const totalPlayer: number|undefined = contest?.id
      ? await this.getTotalPlayerInContest(contest.id)
      : undefined;

    let totalEntries:number|undefined = undefined;
    if (token && contest) {
      const provider = await accountService.getUserProviderByToken(token);
      if (provider) {
        totalEntries = await this.getUserTotalTixInContest(contest.id, provider.userId);
      }
    }

    const results: IContestSummary = {
      totalAllPastWinner: winners.length,
      startDate: contest?.startDate,
      pastWinners: winners.map(user => {
        const item:IContestWiner = {
          state: user.state ?? '',
          userName: user.userName ?? '',
          city: user.city ?? ''
        };
        return item;
      }),
      prizeValue: contest?.prizeValue ?? undefined,
      totalEntries,
      totalPlayer
    };

    return results;
  };

  public getUserContests = async (page: number, query: string): Promise<IBaseResponse<IUserContestResponse>> => {
    let result: IBaseResponse<IUserContestResponse> = {
      page: page,
      results: [],
      totalPages: 0,
      totalResults: 0
    };

    const queryCount = this.queryUsersContest(query, true, undefined);

    let totalRows = await prisma.$queryRawUnsafe<any[]>(queryCount);
    const total = totalRows?.length
      ? totalRows[0].total
      : 0;

    result.totalResults = Number(total);
    result.totalPages = Number(total) % this.DEFAULT_PAGE_SIZE == 0 
        ? Number(total)/this.DEFAULT_PAGE_SIZE 
        : ~~(Number(total)/this.DEFAULT_PAGE_SIZE) + 1;

    if( (page - 1) * this.DEFAULT_PAGE_SIZE >= total) {
      return result;
    }

    const skip = (page - 1) * this.DEFAULT_PAGE_SIZE;

    const queryDatasource = this.queryUsersContest(query, false, skip);
    
    let users = await prisma.$queryRawUnsafe<IUserContestResponse[]>(queryDatasource);
    if (!users.length) {
      return result;
    }

    result.results = users;
    return result;
};

  private createUserTixs = async (contestId: string, userId: string, totalCreateTix: number): Promise<void> => {
    let userTixs: UserTix[] = [];
    for(let index = 0; index < totalCreateTix; index ++) {
      const userTix: UserTix = {
        contestId: contestId,
        createdAt: new Date(),
        id: v4(),
        numberCode: randomTixCode(),
        updatedAt: new Date(),
        userId: userId,
        val: DEFAULT_EXCHANGE_TIX_POINT
      };
      userTixs.push(userTix);
    }
    
    await prisma.userTix.createMany({
      data: userTixs
    });
  }

  private getTotalPlayerInContest = async (contestId: string): Promise<number> => {
    const total = await prisma.user.count({
      where: {
        userTixs: {
          some: {
            contestId: contestId
          }
        }
      }
    });
    return total;
  }

  private getUserTotalTixInContest = async (contestId: string, userId: string): Promise<number> => {
    const total = await prisma.userTix.count({
      where: {
        userId: userId,
        contestId: contestId
      }
    });
    return total;
  }

  private getCurrentContestInfo = async (): Promise<Contest|null> => {
    const contest = await prisma.contest.findFirst({
      where: {
        status: ContestStatus.RUNNING,
        endDate: {
          gt: new Date()
        }
      }
    });
    return contest;
  }

  private getUserWinners = async (): Promise<User[]> => {
    const winners = await prisma.user.findMany({
      where: {
        userTixs: {
          some: {
            contestWonStats: {
              some: {
                id: {
                  not: ''
                }
              }
            }
          }
        }
      }
    });
    
    return winners;
  }

  private queryUsersContest = (query: string, isCount: boolean, offset?: number): string => {
    const keyword = `%${query ?? ''}%`;

    const head = isCount
      ? `
      SELECT CAST(COUNT(u.id) AS DOUBLE) AS total
      `
      : `
      SELECT u.id
      , u.userName
        , u.email
        , u.phone
        , u.state
        , u.city
        , CAST(ut.totalTix AS DOUBLE) totalTix
        , ut.tixCreatedAt
        , cws.lastWonDate
      `;
    const body = `
    FROM User u
    JOIN LATERAL (
        SELECT *
        FROM Contest ct
        WHERE ct.endDate > utc_date()
        AND ct.status = '${ContestStatus.RUNNING}'
      LIMIT 1
        ) ct ON 1=1
    JOIN LATERAL (
        SELECT COUNT(1) AS totalTix, MAX(createdAt) tixCreatedAt
        FROM UserTix ut
        WHERE ut.userId = u.id
        AND ut.contestId = ct.id
      GROUP BY ut.userId
        ) ut ON 1=1
    LEFT JOIN LATERAL (
        SELECT cws.createdAt AS lastWonDate
        FROM ContestWonStat cws
        JOIN UserTix utw ON cws.userTixId = utw.id
        WHERE utw.userId = u.id
        ORDER BY cws.createdAt DESC
        LIMIT 1
          ) cws ON 1=1
   WHERE u.email LIKE '${keyword}' 
        OR u.phone like '${keyword}' 
        OR u.userName like '${keyword}'
        OR u.city like '${keyword}'
        OR u.state like '${keyword}'
    `;
    const foot = isCount
      ? ''
      : `LIMIT ${offset},${this.DEFAULT_PAGE_SIZE}`;

    const results = `
      ${head}
      ${body}
      ${foot}
    `;

    return results;
  }
}

const contestService = new ContestService();

export default contestService;
