import prisma from "@/utils/prisma.util";
import { Prisma, UserGenreMediaRoundGame, UserMediaAnswer, UserMediaStat } from "@prisma/client";import { IQuestionInfo, IQuestionOption, IQuestionaireInfo, IUserAnswerRequest, IUserMediaStatInfo } from "@/model/questionaire/questionaire";
import { accountService, providerService, questionaireService } from "..";
import { v4 } from "uuid";
import { RATE_QUESTIONAIRE_SCORE, SELECT_QUESTIONAIRE_SCORE, VIEW_ADS_TITLE_SCORE, VIEW_GAME_TITLE_SCORE } from "@/utils/constant.util";
import { IUpdateGameGenreMediaRequest } from "@/model/media/media";
import { UserGameStatus } from "@/utils/enum";

class UserMediaService {
  
  public submitViewGame = async(token: string, mediaItemId: string): Promise<void> => {
    // #region validate data
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return;
    }

    const where = {
      AND: [
        { userId: provider.userId },
        { mediaItemId: mediaItemId }
      ]
    };
    let userMediaStat = await prisma.userMediaStat.findFirst({
      where
    });

    const userGenreMediaRoundGame = await this.getUserGenreMediaRoundGame(provider.userId, mediaItemId);
        
    if (!userMediaStat) {      
      userMediaStat = {
        createdAt: new Date(),
        id: v4(),
        mediaItemId: mediaItemId,
        likePoints: null,
        rateScore: null,
        selectScore: null,
        viewAdsScore: null,
        updatedAt: new Date(),
        userId: provider.userId,
        userGenreMediaRoundGameId: userGenreMediaRoundGame?.id ?? null,
        viewGameScore: VIEW_GAME_TITLE_SCORE
      };

      await prisma.userMediaStat.create({data: userMediaStat});
    } else {
      await prisma.userMediaStat.updateMany({
        where,
        data: {
          updatedAt: new Date(),
          viewGameScore: VIEW_GAME_TITLE_SCORE,
          userGenreMediaRoundGameId: userGenreMediaRoundGame?.id ?? null
        }
      });
    }

    await accountService.updateTotalScoreUser(provider.userId);
  }

  public submitViewAds = async(token: string, mediaItemId: string): Promise<void> => {
    // #region validate data
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return;
    }

    const where = {
      AND: [
        { userId: provider.userId },
        { mediaItemId: mediaItemId }
      ]
    };
    let userMediaStat = await prisma.userMediaStat.findFirst({
      where
    });

    const userGenreMediaRoundGame = await this.getUserGenreMediaRoundGame(provider.userId, mediaItemId);
        
    if (!userMediaStat) {      
      userMediaStat = {
        createdAt: new Date(),
        id: v4(),
        mediaItemId: mediaItemId,
        likePoints: null,
        rateScore: null,
        selectScore: null,
        viewAdsScore: VIEW_ADS_TITLE_SCORE,
        updatedAt: new Date(),
        userId: provider.userId,
        userGenreMediaRoundGameId: userGenreMediaRoundGame?.id ?? null,
        viewGameScore: null
      };

      await prisma.userMediaStat.create({data: userMediaStat});
    } else {
      await prisma.userMediaStat.updateMany({
        where,
        data: {
          updatedAt: new Date(),
          viewAdsScore: VIEW_ADS_TITLE_SCORE,
          userGenreMediaRoundGameId: userGenreMediaRoundGame?.id ?? null
        }
      });
    }

    await accountService.updateTotalScoreUser(provider.userId);
  }
  
  public submitQuestionaires = async(token: string, request: IUserAnswerRequest): Promise<IQuestionaireInfo|undefined> => { 
    // #region validate data
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return undefined;
    }

    const isValidRequest = await this.checkValidQuestionAnswerRequest(request);
    if (!isValidRequest) {
      return undefined;
    }

    // #endregion

    // #region post data

    const where = {
      AND: [
        { userId: provider.userId },
        { mediaItemId: request.mediaItemId }
      ]
    };
    let userMediaQuestionaire = await prisma.userMediaQuestionaire.findFirst({
      where
    });
    
    if (!userMediaQuestionaire) {
      userMediaQuestionaire = {
        createdAt: new Date(),
        id: v4(),
        mediaItemId: request.mediaItemId,
        questionaireId: request.questionaireInfo.id,
        updatedAt: new Date(),
        userId: provider.userId
      };
      await prisma.userMediaQuestionaire.create({data: userMediaQuestionaire});
    } else {
      await prisma.userMediaAnswer.deleteMany({
        where: { userMediaQuestionaireId: userMediaQuestionaire.id }
      });

      if (userMediaQuestionaire.questionaireId !== request.questionaireInfo.id) {
        userMediaQuestionaire.updatedAt = new Date();
        userMediaQuestionaire.questionaireId = request.questionaireInfo.id;

        await prisma.userMediaQuestionaire.updateMany({
          data: userMediaQuestionaire,
          where
        })
      }
    }

    let userMediaAnswers: UserMediaAnswer[] = [];
    request.questionaireInfo.questions?.forEach(q => {
      q.options.forEach(oId => {
        const answer: UserMediaAnswer = {
          createdAt: new Date(),
          id: v4(),
          questionOptionId: oId.id,
          updatedAt: new Date(),
          userMediaQuestionaireId: userMediaQuestionaire?.id ?? '',
          point: oId.point ?? null
        };

        userMediaAnswers.push(answer);
      })
    })

    if (userMediaAnswers?.length) {
      await prisma.userMediaAnswer.createMany({data: userMediaAnswers});
    }
    
    // #endregion

    // #region save stats data

    const userGenreMediaRoundGame = await this.getUserGenreMediaRoundGame(provider.userId, request.mediaItemId);
          
    const whereUserMediaStat = {
      AND: [
        { userId: provider.userId },
        { mediaItemId: request.mediaItemId }
      ]
    };
    let userMediaStat = await prisma.userMediaStat.findFirst({
      where: whereUserMediaStat
    });

    let likePoints: number|null = null;

    request.questionaireInfo.questions?.forEach(q => {
      q.options.forEach(qO => {
        if (qO.point) {
          likePoints = (likePoints ?? 0) + qO.point;
        }
      })
    })

    const rateScore: number|null = request.questionaireInfo.questions?.length
      ? RATE_QUESTIONAIRE_SCORE
      : null;

    if (!userMediaStat) {
      userMediaStat = {
        createdAt: new Date(),
        id: v4(),
        mediaItemId: request.mediaItemId,
        likePoints: likePoints,
        rateScore: rateScore,
        selectScore: SELECT_QUESTIONAIRE_SCORE,
        viewAdsScore: null,
        updatedAt: new Date(),
        userId: provider.userId,
        userGenreMediaRoundGameId: userGenreMediaRoundGame?.id ?? null,
        viewGameScore: null
      };

      await prisma.userMediaStat.create({data: userMediaStat});
    } else {
      userMediaStat.updatedAt = new Date();
      userMediaStat.likePoints = userMediaStat.likePoints ?? likePoints;
      userMediaStat.rateScore = userMediaStat.rateScore ?? rateScore;
      userMediaStat.selectScore = userMediaStat.selectScore ?? SELECT_QUESTIONAIRE_SCORE;
      userMediaStat.userGenreMediaRoundGameId = userGenreMediaRoundGame?.id ?? null;

      await prisma.userMediaStat.updateMany({
        data: userMediaStat,
        where: whereUserMediaStat
      });

      await accountService.updateTotalScoreUser(provider.userId);
    }

    // #endregion
  
    const result = await this.getUserQuestionaireSelected(provider.userId, request.mediaItemId);
    return result;
  }

  public updateGameGenreMedia = async (token: string, request: IUpdateGameGenreMediaRequest): Promise<void> => {
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return;
    }

    const whereUserGenreMedia = {
      AND: [
        { mediaItemId: request.mediaItemId },
        { userGenreRoundGameId: request.id },
        { status: UserGameStatus.PENDING },
        {
          userGenreRoundGame: {
            userRoundGame: {
              userId: provider.userId
            }
          }
        }
      ]
    };
    const userGenreMediaRoundGame = await prisma.userGenreMediaRoundGame.findFirst({
      where: whereUserGenreMedia,
    });

    if (!userGenreMediaRoundGame) {
      return;
    }

    await prisma.userGenreMediaRoundGame.update({
      where: {
        id: userGenreMediaRoundGame.id
      },
      data: {
        updatedAt: new Date(),
        status: UserGameStatus.COMPLETE
      }
    });

    // Update User round game to complete
    const query = `
      UPDATE UserRoundGame ur
      JOIN UserGenreRoundGame ugr ON ugr.userRoundGameId = ur.id
      SET ur.status = '${UserGameStatus.COMPLETE}',
        ur.updatedAt = UTC_DATE()
      WHERE ugr.id = '${request.id}'
        AND NOT EXISTS (
            SELECT *
            FROM UserGenreMediaRoundGame ugmrg
            JOIN UserGenreRoundGame ugr2 ON ugmrg.userGenreRoundGameId = ugr2.id
            WHERE ugr2.userRoundGameId = ur.Id
              AND ugmrg.status = '${UserGameStatus.PENDING}' 
            LIMIT 1
          );`;
    await prisma.$executeRaw(Prisma.raw(query));
  };
  
  private getUserGenreMediaRoundGame = async(userId: string, mediaItemId: string): Promise<UserGenreMediaRoundGame|null> => {
    const userGenreMediaRoundGame = await prisma.userGenreMediaRoundGame.findFirst({
      where: {
        AND: [
          {
            mediaItemId: mediaItemId,
            userGenreRoundGame: {
              userRoundGame: {
                userId: userId
              }
            }
          }
        ]
      }
    });
    return userGenreMediaRoundGame;
  }

  public getUserMediaAnswer = async(token: string, mediaItemId: string): Promise<IUserMediaStatInfo|undefined> => {
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return;
    }

    return await this.getUserMediaAnswerByUserId(provider.userId, mediaItemId);
  }

  public getUserMediaAnswerByUserId = async(userId: string, mediaItemId: string): Promise<IUserMediaStatInfo|undefined> => {
    const [userMediaStat, questionaire] = await Promise.all([
      this.getUserMediaStat(userId, mediaItemId),
      this.getUserQuestionaireSelected(userId, mediaItemId)
    ]);

    let results: IUserMediaStatInfo = {
      mediaItemId: mediaItemId,
      isRateMedia: !!questionaire && !!userMediaStat?.rateScore,
      isSelectQuestionare: !!questionaire && !!userMediaStat?.selectScore,
      isWatchAds: !!userMediaStat?.viewAdsScore,
      isWatchGame: !!userMediaStat?.viewGameScore,
      questionaireSeleted: questionaire
    };
    
    return results;
  }

  private getUserMediaStat = async(userId: string, mediaItemId: string): Promise<UserMediaStat|null> => {
    let userMediaStat = await prisma.userMediaStat.findFirst({
      where: {
        AND: [
          { userId: userId },
          { mediaItemId: mediaItemId }
        ]
      }
    });

    return userMediaStat;
  }

  private getUserQuestionaireSelected = async(userId: string, mediaItemId: string): Promise<IQuestionaireInfo|undefined> => {
    let userMediaQuestionaire = await prisma.userMediaQuestionaire.findFirst({
      where: {
        AND: [
          { userId: userId },
          { mediaItemId: mediaItemId }
        ]
      }
    });
    if (!userMediaQuestionaire) {
      return;
    }

    const answers = await prisma.userMediaAnswer.findMany({
      where: {
        AND: [
          {userMediaQuestionaireId: userMediaQuestionaire.id },
        ]
      }
    });

    let questionaire = await questionaireService.getQuestionaireById(userMediaQuestionaire.questionaireId);
    if (!questionaire) {
      return;
    }

    questionaire.questions.forEach(q => {
      q.options.forEach(o => {
        const answer = answers.filter(x => x.questionOptionId === o.id)[0];
        o.isSelected = !!answer;
        o.point = answer?.point ?? 1;
      })
    })
    
    return questionaire;
  }

  private checkValidQuestionAnswerRequest = async(request: IUserAnswerRequest): Promise<boolean> => {
    const questionaire = await questionaireService.getQuestionaireById(request.questionaireInfo.id);
    if (!questionaire) {
      return false;
    }
    
    request.questionaireInfo.questions?.forEach(qR => {
      let question = questionaire.questions.filter(q => q.id === qR.id)[0];
      if (!question) {
        return false;
      }
      qR.options.forEach(qROption => {
        const isValidOption = question.options.some(o => o.id === qROption.id);
        if (!isValidOption) {
          return false;
        }
      })
    });

    return true;
  }
}

const userMediaService = new UserMediaService();

export default userMediaService;
