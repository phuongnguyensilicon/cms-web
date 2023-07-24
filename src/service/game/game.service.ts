import prisma from "@/utils/prisma.util";
import { accountService, mediaService, metaDataService } from "..";
import { IUserGameDataSummaryInfo, IUserGameStatInfo, IUserGameSummaryInfo } from "@/model/game/game";
import { genreGames } from "@/metadata/genre-game";
import { IUserGenreGameDataInfo, IUserMediaGameInfo } from "@/model/media/media";
import { IUserMediaInfoStatus } from "@/model/account/userInfo";
import { UserGameStatus } from "@/utils/enum";
import { transformGameMedia } from "@/transform/media.transform";

class GameService {
  
  public gameSummaryByGenre = async(token: string, id: string): Promise<IUserGameSummaryInfo|undefined> => {
    // #region validate data
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return undefined;
    }

    let query = `
    SELECT CAST(mediaSummary.totalScore AS double) AS  totalScore
        , mediaHighestLikePoint.mediaItemId AS highestMediaItemId
            , CAST(mediaHighestLikePoint.totalLikePoints AS double) AS highestMediaItemTotalPoint
            , mediaHighestLikePoint.name AS highestMediaItemName
            , ugrg.genre
            , ugrg.id
    FROM UserGenreRoundGame ugrg
    LEFT JOIN LATERAL (
          SELECT IFNULL(ums.likePoints, 0) as totalLikePoints
          , m.id AS mediaItemId
                , m.name
        FROM UserGenreMediaRoundGame ugmrg
            JOIN UserMediaStat ums  ON ugmrg.id = ums.userGenreMediaRoundGameId AND ugmrg.mediaItemId = ums.mediaItemId
            JOIN MediaItem m ON m.id = ums.mediaItemId
            WHERE ugmrg.userGenreRoundGameId = ugrg.id
            ORDER BY IFNULL(ums.likePoints, 0) DESC
            LIMIT 1
        ) mediaHighestLikePoint ON 1=1
    LEFT JOIN LATERAL (
          SELECT SUM(IFNULL(ums.selectScore, 0) + IFNULL(ums.viewAdsScore, 0) + IFNULL(ums.rateScore, 0)) as totalScore
        FROM UserGenreMediaRoundGame ugmrg
        JOIN UserMediaStat ums ON ugmrg.id = ums.userGenreMediaRoundGameId
          WHERE ugmrg.userGenreRoundGameId = ugrg.id
        ) mediaSummary ON 1=1
    where ugrg.id = '${id}';
    `;

    const itemDbs: IUserGameDataSummaryInfo[] = await prisma.$queryRawUnsafe<IUserGameDataSummaryInfo[]>(query);
    if (!itemDbs?.length) {
      return undefined;
    }
    const itemDb = itemDbs[0];
    const nextGame = await this.getNextGamePending(id, itemDb.genre);
    

    const results:IUserGameSummaryInfo = {
      genre: itemDb.genre,
      id: itemDb.id,
      totalScore: itemDb.totalScore,
      highestMediaItem: {
        id: itemDb.highestMediaItemId,
        name: itemDb.highestMediaItemName,
        totalPoint: itemDb.highestMediaItemTotalPoint
      },
      nextGameInfo: {
        id: nextGame?.id,
        name: nextGame?.genre
      }
    };
    return results;
  }

  public gameStats = async(token?: string): Promise<IUserGameStatInfo[]> => {
    // #region validate data
    if (!token) {
      const results: IUserGameStatInfo[] = genreGames.map(genre => {
        const itemDb: IUserGameStatInfo= {
          genre: genre,
          id: ''
        };
        
        return itemDb;
      });

      return results;
    }
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return [];
    }

    const userRoundGame = await prisma.userRoundGame.findFirst({
      where: {
        userId: provider.userId
      },
      take: 1,
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!userRoundGame) {
      return [];
    }
    let query = `
    SELECT ugrg.id
      ,ugrg.genre
      ,CAST(ugmrgPending.total AS double) AS totalPending
      ,CAST(ugmrg.total AS double) AS total
      ,CASE
        WHEN ugmrgPending.total = 0 THEN CAST(100 AS double) 
        WHEN ugmrg.total = 0 THEN CAST(0 AS double) 
        ELSE  CAST(((ugmrg.total - ugmrgPending.total) * 100) / ugmrg.total AS double) 
      END AS completePercentage
    FROM UserGenreRoundGame ugrg
    LEFT JOIN LATERAL (
      SELECT COUNT(1) AS total
        FROM UserGenreMediaRoundGame ugmrg
        WHERE ugmrg.userGenreRoundGameId = ugrg.id
          AND ugmrg.status = 'pending'
    ) ugmrgPending ON 1=1
    LEFT JOIN LATERAL (
      SELECT COUNT(1) AS total
        FROM UserGenreMediaRoundGame ugmrg
        WHERE ugmrg.userGenreRoundGameId = ugrg.id
    ) ugmrg ON 1=1
    WHERE ugrg.userRoundGameId = '${userRoundGame.id}';
    `;

    const resultDbs: any[] = await prisma.$queryRawUnsafe<any[]>(query);

    let results: IUserGameStatInfo[] = [];

    genreGames.forEach(genre => {
      const itemDb = resultDbs.filter(x => x.genre === genre)[0];
      if (itemDb) {
        results.push({ ...itemDb, completePercentage: Math.round(itemDb.completePercentage) });
      }
    });
    
    return results;
  }

  public getMediaItemsByGameGenreId = async(token: string, id: string): Promise<IUserGenreGameDataInfo|undefined> => {
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider) {
      return undefined;
    }

    const userGenreRoundGame = await prisma.userGenreRoundGame.findFirst({
      where: {
        AND: [
          { id: id },
          {
            userRoundGame: {
              userId: provider.userId
            }
          }
        ]
      }
    });
    if (!userGenreRoundGame) {
      return undefined;
    }
    const userGenreMediaRoundGames = await prisma.userGenreMediaRoundGame.findMany({
      where: {
        userGenreRoundGameId: id
      },
      include: {
        mediaItem: {
          include: {
            mediaAdditionalItems: true,
            mediaWatchProviders: true
          }
        }
      }
    });

    const mediaItemIds = userGenreMediaRoundGames.map(x => x.mediaItemId);    
    const configuration = await metaDataService.getConfiguration();
    
    let userMediaStatuses: IUserMediaInfoStatus[] = [];
    let gameStatuses: any[] = [];
    if (token) {      
      [userMediaStatuses, gameStatuses] = await Promise.all([
        mediaService.getV2UserMediaStatuses(token, mediaItemIds),
        mediaService.getUserMediaGameStatus(mediaItemIds, id)
      ]);
    }
    
    
    const items = userGenreMediaRoundGames.map(userGenreMediaRoundGame => 
      {
        const mediaDb = userGenreMediaRoundGame.mediaItem;
        const additionalItems = mediaDb?.mediaAdditionalItems;
        const watchProviders = mediaDb?.mediaWatchProviders;
        let item: IUserMediaGameInfo = {
          info: mediaService.convertMediaToMediaShortInfo(mediaDb, configuration, watchProviders, additionalItems)
        };

        let info = mediaService.convertMediaToMediaShortInfo(mediaDb, configuration, watchProviders, []);
        if (additionalItems.length) {   
          const gameVideo = transformGameMedia(additionalItems);
          if (gameVideo) {
            info.videos = [{
              ...gameVideo,
              active: true,
              mostPopular: false
            }];
          }             
        }

        if (item.info.videos?.length) {
          item.info.videos = [item.info.videos?.[0]];
        }
        
        if (token && userMediaStatuses.length) {
          const userMediaStatus = userMediaStatuses.filter(x => x?.mediaItemId === mediaDb.id)[0];
          const gameStatus = gameStatuses.filter(x => x?.mediaItemId === mediaDb.id)[0];
          item.status = {
            isExistWatchList: userMediaStatus?.isExistWatchList ?? false,
            rate: userMediaStatus.rate,
            isCompleteGame: gameStatus?.isCompleteGame ?? false,            
          };
        }
        
        return item;
      });

    const results: IUserGenreGameDataInfo = {
      genre: {
        name: userGenreRoundGame.genre,
        id: userGenreRoundGame.id,
        total: items.length,
        totalComplete: items.filter(x => x.status?.isCompleteGame ?? false).length
      },
      titles: items
    };
      
    return results;
  }
  
  private getNextGamePending = async(userGenreRoundGameId: string, currentGenre: string): Promise<any> => {
    let query = `
      SELECT ugrgPending.id, ugrgPending.genre
      FROM UserGenreRoundGame ugrg
      JOIN UserRoundGame urg ON urg.id = ugrg.userRoundGameId
      JOIN UserGenreRoundGame ugrgPending ON ugrgPending.userRoundGameId = urg.id
      WHERE ugrg.id = '${userGenreRoundGameId}'
        AND ugrgPending.id <> '${userGenreRoundGameId}'
          AND EXISTS (
          SELECT 1
              FROM UserGenreMediaRoundGame ugmrg 
              WHERE ugmrg.userGenreRoundGameId = ugrgPending.id
            AND ugmrg.status = '${UserGameStatus.PENDING}'
          LIMIT 1
          )
      ;
    `;

    const itemDbs: any[] = await prisma.$queryRawUnsafe<any[]>(query);
    if (!itemDbs?.length) {
      return undefined;
    }
    
    const currentIndex = genreGames.indexOf(currentGenre);    
    let nextIndex = currentIndex + 1;
    while(true) {
      if (nextIndex >= genreGames.length) {
        nextIndex -= genreGames.length;
      }
      const item = itemDbs.filter(x => x.genre === genreGames[nextIndex])[0];
      if (item) {
        return item;
      }
      nextIndex++;
    }
  }
}

const gameService = new GameService();

export default gameService;
