import prisma from "@/utils/prisma.util";
import { genreGames } from "@/metadata/genre-game";
import { Prisma } from "@prisma/client";
import mediaService from "@services/media/media.service";


class CronService {  
  public generateGames = async () => {
    const users = await prisma.user.findMany();

    await prisma.$executeRaw`CALL spGenerateRoundGame;`;

    for(let index = 0; index < users.length; index ++) {
      await this.excuteGenerateUserGame(users[index].id);
    }
  };

  public generateUserGame = async (userId: string) => {
    await prisma.$executeRaw`CALL spGenerateRoundGame;`;

    await this.excuteGenerateUserGame(userId);
  };

  public removeTitleDuplicate = async(): Promise<void> => {
    let pageSize = 100;
    let pageIndex = 0;

    while(true)
    {
      const offset = pageSize * pageIndex;
      const query = `
        SELECT m.id, m.mediaType, m.tmdbId, t.displayOrder
        FROM MediaItem m
        INNER JOIN (
              SELECT id, tmdbId, mediaType, ROW_NUMBER() OVER(PARTITION BY mediaType, tmdbid ORDER BY tmdbid) AS displayOrder
              FROM MediaItem 
              ) t ON m.id = t.id
        WHERE m.mediaType in ('movie', 'tv') 
          AND t.displayOrder > 1
            AND NOT EXISTS (
            SELECT 1
                FROM MediaListNameItem mli
                WHERE mli.mediaItemId = m.id
                LIMIT 1
            )
        ORDER BY m.tmdbId
        LIMIT 0,${pageSize};
      `;

      const mediaItems = await prisma.$queryRaw<any[]>(Prisma.raw(query));

      if (!mediaItems.length) {
        break;
      }
  
      pageIndex++;

      const ids = mediaItems.map(x => x.id);
       
      await mediaService.deleteMediaItemByIds(ids);
    }
  }

  private excuteGenerateUserGame = async(userId: string) => {
    const command = `CALL spGenerateGenreUserGame('${JSON.stringify(genreGames)}', '${userId}');`;
    await prisma.$executeRawUnsafe(command);
  }
}

const cronService = new CronService();

export default cronService;
