import prisma from "@/utils/prisma.util";
import { v4 } from "uuid";
import { generateUserName, isAbsolutePath, randomString } from "@/utils/common.util";
import { IUpdateUserParams, IUserFeedbackRequest, IUserInfo, IUserRewardInfo, IUserStatsResponse } from "@/model/account/userInfo";
import { parseJwtTokenAuth0 } from "@/utils/jwt.utils";
import * as metaDataState from "@/metadata/us-state";
import * as metaDataGender from "@/metadata/gender";

import { Prisma, User, UserFeedback, UserProvider, UserScoreStat, UserStreamer } from "@prisma/client";
import { metaDataService, redisService } from "..";
import { IRedisStreamer } from "@/model/metadata/streamers";
import { ERROR_MESSAGE } from "@/utils/constant.util";
import { TMDBSizeEnum } from "@/utils/enum";
import cronService from "@services/cron/cron-service";
import { accountLevels } from "@/metadata/level";
import { IBaseResponse } from "@/model/common/tmdp-response";


class AccountService {  
  readonly DEFAULT_PAGE_SIZE = 20;

  public checkEmailPhoneUpdateValid = async (token: string, sms = '', email = ''): Promise<boolean> => {
    const provider = await this.getUserProviderByToken(token);
      if (!provider?.userId) {
        return false;
      }

      const where: Prisma.UserWhereInput =
      !!sms ?
       {
        AND: [
          {
            NOT: {
              id: provider.userId
            }
          }, {
            phone: sms
          }
        ]
      }
      : {
        AND: [
          {
            NOT: {
              id: provider.userId
            }
          }, {
            email: email
          }
        ]
      }
      const otherUser = await prisma.user.findFirst({
        where: where
      });

      if (otherUser) {
        return false;
      }
      return true;
  };

  public updatePhoneEmail = async (token: string, sms = '', email = '', payload: any): Promise<any> => {
    try {
      const provider = await this.getUserProviderByToken(token);
      if (!provider?.userId || provider?.sub === payload.sub ) {
        return false;
      }

      let currentProvider = await prisma.userProvider.findFirst({
        where: {
          AND: [
            {userId: provider.userId},
            {sub: payload.sub }
          ]
        }
      });

      if (currentProvider) {
        return false;
      }

      currentProvider = {
        createdAt: new Date(),
        id: v4(),
        sub: payload.sub,
        updatedAt: new Date(),
        userId: provider.userId
      };

      await prisma.userProvider.create({data: currentProvider});

      const updateData: Prisma.UserUpdateInput = {
        updatedAt: new Date()
      };
      if (sms) {
        updateData.phone = sms;
      } else if(email) {
        updateData.email = email;
      }
      await prisma.user.update({
        where: {
          id: provider.userId
        },
        data: updateData
      });

      const user = await prisma.user.findFirst({
        where: {
          id: provider.userId
        }
      });
      return { error: false, user };
    } catch (error: any) {
      const { message } = error;
      return {
        error: true,
        message
      };
    }
  };

  public syncAccount = async (token: string) => {
    const { payload } = await parseJwtTokenAuth0(token);
    try {
      if (payload?.sub) {
        const userProvider = await prisma.userProvider.findFirst({
          where: {
            sub: payload.sub
          },
          include: {
            user: true
          }
        });

        const firstName =
          !payload.family_name && !payload.given_name
            ? payload.nickname ?? ""
            : payload.family_name ?? "";

        const lastName = payload.given_name ?? "";

        if (userProvider?.user) {
          return {
            error: false,
            result: {...userProvider.user, sub: payload.sub}
          };
        } else {
          //let userName = generateUserName(payload.nickname ?? '');
 
          const user = {
            id: v4(),
            email: payload.email ?? "",
            firstName: firstName,
            lastName: lastName,
            phone: payload.phone_number ?? "",
            picture: payload.picture ?? ""
          };

          const result = await prisma.user.create({ data: user });

          const userProvider: UserProvider = {
            id: v4(),
            userId: user.id,
            sub: payload.sub,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await prisma.userProvider.create({ data: userProvider });

          await cronService.generateUserGame(user.id);
          
          return {
            error: false,
            result: {...result, sub: payload.sub}
          };
        }
      } else {
        return {
          error: true,
          message: ERROR_MESSAGE.SUB_AUTH0_INVALID
        };
      }
    } catch (error: any) {
      const { message } = error;
      return {
        error: true,
        message
      };
    }
  };

  public syncUpdateUser = async(token: string): Promise<void> => {
    try {
      const { payload } = await parseJwtTokenAuth0(token);
      if (!payload || !payload.sub) {
        return;
      }
      
      const where: Prisma.UserProviderWhereInput = {
        sub: payload.sub
      };
  
      const include: Prisma.UserProviderInclude = {
        user: true
      };
  
      const userProvider = await prisma.userProvider.findFirst({ 
        where, 
        include
       });
  
      const user = userProvider?.user;
      if (!user) {
        return;
      }
  
      let canUpdate = false;
      let dataUser: Prisma.UserUpdateInput = {
        updatedAt: new Date()
      } 
  
      if (payload.picture && user.picture !== payload.picture) {
        dataUser.picture = payload.picture;
        canUpdate = true;
      }
  
      if (payload.email && user.email !== payload.email) {
        dataUser.email = payload.email;
        canUpdate = true;
      }
  
      if (payload.phone_number && user.phone !== payload.phone_number) {
        dataUser.phone = payload.phone_number;
        canUpdate = true;
      }
  
      if (!canUpdate) {
        return;
      }
  
      const update: Prisma.UserUpdateArgs = {
        where: {
          id: user.id
        },
        data: dataUser
      };
  
      await prisma.user.update(update);

    } catch(e) {
      console.error(e);
    }
  }

  public checkUserNameValid = async(token: string, userName: string ): Promise<boolean> => {
    if (!userName) {
      return false;
    }

    const { payload } = await parseJwtTokenAuth0(token);
    if (!payload || !payload.sub) {
      return false;
    }

    const where: Prisma.UserProviderWhereInput = {
      sub: payload.sub
    };

    const userProvider = await prisma.userProvider.findFirst({ 
      where, 
     });

    if (!userProvider) {
      return true;
    }

    const whereUser: Prisma.UserWhereInput = {
      AND: [
        {
          id: {
            not: userProvider.userId
          }
        },
        {
          userName: userName
        }
      ]
    };

    const isValid = await prisma.user.count({where: whereUser}) <= 0;
    
    return isValid;
  }
  
  public updateUser = async (requestData: IUpdateUserParams, token: string) => {
    const { payload } = await parseJwtTokenAuth0(token);
    if (!payload || !payload.sub) {
      return {
        error: true,
        message: ERROR_MESSAGE.SUB_AUTH0_INVALID
      };
    } else {
      try {
        const userProvider = await prisma.userProvider.findFirst({
          where: {
            sub: payload.sub
          },
          include: {
            user: true
          }
        });

        const { user, userId } = userProvider as any;

        if (user && userId) {
          const { gender, state, dob, city, userName, picture, avatar } =
            requestData;
          // if (gender) {
          //   const isValid = metaDataGender.genders.some(x => x.id === gender);
          //   gender = isValid ? gender: '';
          // }

          // if (state) {
          //   const isValid = metaDataState.states.some(x => x.abbreviation === state);
          //   state = isValid ? state: '';
          // }

          const updateUser: Prisma.UserUpdateArgs = {
            where: {
              id: userId
            },
            data: {
              ...(userName && { userName }),
              ...(city && { city }),
              ...(state && { state }),
              ...(avatar && { avatar }),
              ...(picture && { picture }),
              ...(gender && { gender }),
              ...(dob && { dob: dob ? new Date(dob) : undefined }), 
            }
          };

          const result = await prisma.user.update(updateUser);

          return {
            error: null,
            result
          };
        } else {
          return {
            error: true,
            message: ERROR_MESSAGE.USER_PROVIDER_AUTH0_NOT_FOUND
          };
        }
      } catch (error: any) {
        const { message } = error;
        if (
          message.includes("Unique constraint failed") &&
          message.includes("User_userName_key")
        ) {
          return {
            error: true,
            message: ERROR_MESSAGE.ACCOUNT_USERNAME_TAKEN
          };
        } else {
          return {
            error: true,
            message
          };
        }
      }
    }
  };

  public subscribleStreamers = async(providerIds: number[], token: string): Promise<void> => {
    const userProvider = await this.getUserProviderByToken(token);
    if (!userProvider) {
      return;
    }

    await prisma.userStreamer.deleteMany({where: {userId: userProvider.userId}});
    const allStreamers = await metaDataService.getStreamers();
    const allStreamerIds = allStreamers.map(x => x.providerId);
    const streamerFilterIds = providerIds.filter(id => allStreamerIds.includes(id));
    if (streamerFilterIds.length) {
      const userStreamers: UserStreamer[] = streamerFilterIds.map(providerId => {
        const userStreamer: UserStreamer = {
          createdAt: new Date(),
          id: v4(),
          providerId: providerId,
          updatedAt: new Date(),
          userId: userProvider.userId
        };
        return userStreamer;
      });

      await prisma.userStreamer.createMany({data: userStreamers});
    }
  }

  public getUserStreamers = async (token: string): Promise<any> => {
    const userProvider = await this.getUserProviderByToken(token);
    if (userProvider) {
      const customStreamers = await metaDataService.getConfiguration();
      const allStreamers = await metaDataService.getStreamers();
      allStreamers.forEach(x => {
        x.logoPath = `${customStreamers.images.secure_base_url}${TMDBSizeEnum.W300}${x.logoPath}`;
      });
      const userStreamers = await prisma.userStreamer.findMany({
        where: { userId: userProvider.userId }
      });
      return { allStreamers, userStreamers };
    } else {
      return [];
    }
  };

  public getUserProviderByToken = async(token: string): Promise<UserProvider|undefined> => {
    const { payload } = await parseJwtTokenAuth0(token);
    if (!payload || !payload.sub) {
      return undefined;
    }

    const where: Prisma.UserProviderWhereInput = {
      sub: payload.sub
    };

    const userProvider = await prisma.userProvider.findFirst({ 
      where, 
     });

    if (!userProvider) {
      return undefined;
    }
    return userProvider;
  }

  
  public addUserFeedback = async(token: string, request: IUserFeedbackRequest): Promise<void> => {
    const provider = await this.getUserProviderByToken(token);
    if (!provider) {
      return;
    }
    
    const userFeedback: UserFeedback = {
      content: request.content,
      createdAt: new Date(),
      id: v4(),
      updatedAt: new Date(),
      userId: provider.userId,
    };

    await prisma.userFeedback.create({data: userFeedback});
  }

  public checkUserExisting = async (
    email: string,
    phone: string
  ): Promise<User | null> => {
    if (!!phone) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: "+1" + phone.replace(/[^0-9]/g, "") }
      });
      return existingUser || null;
    } else if (!!email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: email }
      });
      console.log([{ phone: phone }, { email: email }]);
      return existingUser || null;
    } else {
      return null;
    }
  };

  public countUserStatsMedia = async (
    userId: string,
    isLike: boolean
  ): Promise<number> => {
    const questionaires = await prisma.questionaire.findMany({
      where: {
        AND: [
          {active: true},
          {isLiked: isLike},
          {isWatched: true},
        ]
      }
    });
    if (!questionaires?.length) {
      return 0;
    }
    const questionaireIds = questionaires.map(x => x.id);
    const total = await prisma.userMediaQuestionaire.count({
      where: {
        AND: [
          {userId: userId},
          {
            questionaireId: {
              in: questionaireIds
            }
          }
        ]
      }
    });

    return total;
  };

  public countUserWatchlist = async (
    userId: string
  ): Promise<number> => {
    const total = await prisma.userMediaWatchList.count({
      where: { userId: userId }
    });

    return total;
  };

  public getUserStats = async(token: string): Promise<IUserStatsResponse | undefined> => {
    const provider = await this.getUserProviderByToken(token);
    if (!provider) {
      return undefined;
    }
    
    const [totalLike, totalDislike, totalWatchlist] = await Promise.all([
      this.countUserStatsMedia(provider.userId, true),
      this.countUserStatsMedia(provider.userId, false),
      this.countUserWatchlist(provider.userId)
    ]);

    const result: IUserStatsResponse = {
      totalDiscountClaim: 0,
      totalDislike,
      totalLike,
      totalWatchlist
    }
    return result;
  }

  public updateTotalScoreUser = async (userId: string): Promise<void> => {
    const query = `
      SELECT SUM(IFNULL(selectScore, 0) + IFNULL(viewAdsScore, 0) + IFNULL(rateScore, 0) + IFNULL(viewGameScore, 0)) as totalScore
      FROM UserMediaStat
      WHERE userId = '${userId}';`;

      const totalDbs: any[] = await prisma.$queryRawUnsafe<any[]>(query);
      const totalPoints = totalDbs?.length
        ? (totalDbs[0]?.totalScore ?? 0)
        : 0;

    const userScoreStat = await this.getOrCreateUserScoreStart(userId);
    await prisma.userScoreStat.update({
      where: {
        id: userScoreStat.id
      },
      data: {
        updatedAt: new Date(),
        totalPoint: totalPoints
      }
    });
  };

  public getOrCreateUserScoreStart = async (userId: string): Promise<UserScoreStat> => {
    let userScoreStat = await prisma.userScoreStat.findFirst({
      where: {
        userId: userId
      }
    });

    if (!userScoreStat) {
      const query = `
      SELECT SUM(IFNULL(selectScore, 0) + IFNULL(viewAdsScore, 0) + IFNULL(rateScore, 0) + IFNULL(viewGameScore, 0)) as totalScore
      FROM UserMediaStat
      WHERE userId = '${userId}';`;

      const totalDbs: any[] = await prisma.$queryRawUnsafe<any[]>(query);
      const totalPoints = totalDbs?.length
        ? (totalDbs[0]?.totalScore ?? 0)
        : 0;

      userScoreStat = {
        createdAt: new Date(),
        id: v4(),
        totalPoint: totalPoints,
        totalUsedPoint: 0,
        updatedAt: new Date(),
        userId: userId
      };
      await prisma.userScoreStat.create({
        data: userScoreStat
      });
    }
    return userScoreStat;
  };

  public getUserLevel = async (token: string): Promise<any> => {
    const provider = await this.getUserProviderByToken(token);
    if (!provider) {
      return undefined;
    }
  
    const userScoreStat = await this.getOrCreateUserScoreStart(provider.userId);

    const totalScore = userScoreStat.totalPoint ?? 0;
    const totalUsedScore = userScoreStat?.totalUsedPoint ?? 0;

    const levels = accountLevels();
    for(let index = 0; index < levels.length; index ++) {
      let accountLevel = levels[index];
      if (totalScore < accountLevel.score) {
        const previousLevel = levels[index - 1];
        const totalScoreLevel = accountLevel.score - previousLevel.score;
        const result = {
          level: previousLevel.level,
          point: totalScore,
          nextLevel: accountLevel.level,
          pointRequire: previousLevel.score,
          nextPointRequire: totalScoreLevel,
          completePercentage: Math.round((totalScore - previousLevel.score) * 100 / totalScoreLevel),
          totalUsedScore
        };
        return result;
      }
      if (index === levels.length - 1) {
        const result = {
          level: accountLevel.level,
          point: totalScore,
          nextLevel: accountLevel.level,
          pointRequire: accountLevel.score,
          nextPointRequire: 0,
          completePercentage: 100,
          totalUsedScore
        };
        return result;
      }
    }
    
  };

  private countUserRewards = async(query: string, isRedeem?: boolean) : Promise<number> => {
    query = query ?? '';
    const total = await prisma.user.count({
      where: {
        OR: [
          { email: 
            {
              contains: query
            }
          },
          { userName: 
            {
              contains: query
            }
          }
        ]
      }
    });

    return total;
  }

  private calculateUserScore = async (userId: string): Promise<any> => {
    const query = `
      SELECT SUM(IFNULL(selectScore, 0) + IFNULL(viewAdsScore, 0) + IFNULL(rateScore, 0) + IFNULL(viewGameScore, 0)) as totalScore
      FROM UserMediaStat
      WHERE userId = '${userId}';
    `;

    const totalDbs: any[] = await prisma.$queryRawUnsafe<any[]>(query);
    if (!totalDbs?.length) {
      return {
        userId,
        totalScore: 0
      };
    }

    const totalScore = totalDbs[0].totalScore;
    return {
      userId,
      totalScore
    }
  }
  public getUserRewards = async (page: number, query: string, isRedeem?: boolean): Promise<IBaseResponse<IUserRewardInfo>> => {
    let result: IBaseResponse<IUserRewardInfo> = {
      page: page,
      results: [],
      totalPages: 0,
      totalResults: 0
    };

    let total = await this.countUserRewards(query, isRedeem);

    result.totalResults = Number(total);
    result.totalPages = Number(total) % this.DEFAULT_PAGE_SIZE == 0 
        ? Number(total)/this.DEFAULT_PAGE_SIZE 
        : ~~(Number(total)/this.DEFAULT_PAGE_SIZE) + 1;

    if( (page - 1) * this.DEFAULT_PAGE_SIZE >= total) {
      return result;
    }

    const skip = (page - 1) * this.DEFAULT_PAGE_SIZE;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 
            {
              contains: query
            }
          },
          { userName: 
            {
              contains: query
            }
          }
        ]
      },
      skip: skip,
      take: this.DEFAULT_PAGE_SIZE
    });
    
    if (!users.length) {
      return result;
    }

    const tasks = users.map(x => this.calculateUserScore(x.id));
    const scoreResponses = await Promise.all(tasks);
    let index = 0;
    users.forEach(user => {
      index++;
      const score = scoreResponses.filter(x => x.userId === user.id)[0];
      const item: IUserRewardInfo = {
        id: user.id,
        isRedeem: index % 2 === 0,
        userName: user.userName ?? '',
        email: user.email ?? undefined,
        giftCardType: 'Hulu - $5',
        redeemDate: new Date(),
        totalPoints: score?.totalScore ?? 0
      };
      
      result.results.push(item);
    });
    
    return result;
};
}




const accountService = new AccountService();

export default accountService;
