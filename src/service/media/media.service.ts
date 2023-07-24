import { convertStreamerLogo, createDefaultWatchProvider, getBackgroundProvider } from "@/mapping/streamer-image.logo";
import { getThumbnailUrl } from "@/metadata/videos";
import { IUserMediaInfoStatus, IUserMediaStatus } from "@/model/account/userInfo";
import { IBaseResponse, IBaseScrollResponse, ITmdpBaseResponse } from "@/model/common/tmdp-response";
import { IMediaAdditionalInfo, IMediaAdditionalRequest, IMediaCastInfo, IMediaShortInfo, IMediaWatchProviderInfo, IUpdateMediaRequest, IUpdateMediaStreamerRequest, IUserMediaInfo } from "@/model/media/media";
import { ITmdbCredit, ITmdbCreditResponse, ITmdbMediaShortInfo, ITmdbWatchProviderFlatrateResponse, ITmdbWatchProviderResponse } from "@/model/media/tmdp-media";
import { IConfiguration } from "@/model/metadata/configuration";
import { IQuestionInfo, IQuestionOption, IQuestionaireInfo } from "@/model/questionaire/questionaire";
import { IMediaRecommendationInfo, IRedisGenreGroupMediaItem, IRedisGroupMedias, IRedisMediaItemInfo, IRedisMediaWatchProviderInfo } from "@/model/redis/redis-media-list.name";
import { accountService, mediaTmdbSyncService, metaDataService, redisService, userMediaService } from "@/service";
import { transformGameMedia, transformITmdbMediaShortInfo, transformMediaDisplayOrder, transformRedisTitleVideos, transformSelectedWatchProvider, transformTmdbBaseResponse, transformTrailerMedia } from "@/transform/media.transform";
import { convertToTmdbScore, isAbsolutePath } from "@/utils/common.util";
import { SCORE_DEFAULT } from "@/utils/constant.util";
import { CMSEventEnum, ClixSearchType, ClixTitleVideoType, MediaDetailSourceEnum, TMDBAdditionalSiteEnum, TMDBAdditionalTypeEnum, TMDBCreditEnum, TMDBCreditJobEnum, TMDBMediaTypeEnum, TMDBSizeEnum, UserGameStatus } from "@/utils/enum";
import prisma from "@/utils/prisma.util";
import { getMovieDetail, getMovieWatchProviderDetail, getTmdbMovieCertification, getTmdbMovieCredit, getTmdbMovieExternals, getTmdbMovieKeywords, getTmdbMovieReviews, getTmdbMovieVideos, getTmdbRecommendations, getTmdbTvCertification, getTmdbTvCredit, getTmdbTvExternals, getTmdbTvKeywords, getTmdbTvReviews, getTmdbTvVideos, getTvDetail, getTvWatchProviderDetail, searchMovies, searchTvs } from "@/utils/tmdb.util";
import emitter from "@events/index";
import { MediaAdditionalItem, MediaCreditItem, MediaItem, MediaReviewItem, MediaWatchProvider, Prisma } from "@prisma/client";
import { bool } from "aws-sdk/clients/signer";
import { v4 } from "uuid";

class MediaService {
  readonly DEFAULT_PAGE_SIZE = 20;
  readonly DEFAULT_GROUP_PAGE_SIZE = 100;
  readonly DEFAULT_RECOMMENDATION_TITLE_PAGE_SIZE = 4;

  public getRecommendations =async (mediaItemId: string): Promise<IMediaRecommendationInfo | undefined> => {
    const mediaItem = await prisma.mediaItem.findFirst({
      where: {
        AND: [
          { active: true },
          { id: mediaItemId }
        ]
      },
      include: {
        mediaWatchProviders: true
      }
    });
    if (!mediaItem) {
      return undefined;
    }
    
    const configuration = await metaDataService.getConfiguration();
    let result: IMediaRecommendationInfo = {
      mediaItem: this.convertMediaItemToRedisMediaItem(mediaItem, [], [], configuration),
      recomendations: []
    };

    const watchProviderDbs = mediaItem.mediaWatchProviders ?? [];
    let selectedProvider = watchProviderDbs.filter(x => x.isSelected)[0];
    if (!selectedProvider) {
      selectedProvider = watchProviderDbs[0];
    }
    if (!selectedProvider || !selectedProvider.providerId) {
      return result;
    }

    let where: Prisma.MediaItemWhereInput = { 
      AND: [
        { active: true },
        {
          id: {
            not: mediaItem.id
          }
        },
        { 
          mediaWatchProviders: { 
            some: {      
              providerId: selectedProvider.providerId
            }
           } 
        },
        {
          posterPath: {
            not: null
          }
        },
        {
          posterPath: {
            not: ''
          }
        },
        {
          mediaAdditionalItems: {
            some: {
              active: true
            }
          }
        },
        {
          mediaType: {
            in: [TMDBMediaTypeEnum.MOVIE, TMDBMediaTypeEnum.TV]
          }
        }
      ]
     };
     
    const mediaItems = await prisma.mediaItem.findMany({
      where: where,
      take: this.DEFAULT_RECOMMENDATION_TITLE_PAGE_SIZE

    });
    
    result.recomendations = mediaItems.map(mediaItemDb => 
      this.convertMediaItemToRedisMediaItem(mediaItemDb, [], [], configuration)
    );
    return result;
  }

  public getMediaGroupsByProviderId =async (providerId: number, mediaItemId?: string): Promise<IRedisGroupMedias> => {    
    if (providerId === 0) {
      return { groups: [] };
    }
    
    const providers = await metaDataService.getStreamers();
    const provider = providers.filter(x => x.providerId === providerId)[0];
    if (!provider) {
      return { groups: [] };
    } 
    
    let result: IRedisGroupMedias = {
      provider: {...provider, link: '', isSelected: false, bgColor: getBackgroundProvider(provider.providerId ?? 0)},
      groups: []
    };

    let where: Prisma.MediaItemWhereInput = { 
      AND: [
        { active: true },
        { 
          mediaWatchProviders: { 
            some: {      
              providerId: providerId
            }
           } 
        },
        {
          posterPath: {
            not: null
          }
        },
        {
          posterPath: {
            not: ''
          }
        },
        {
          mediaAdditionalItems: {
            some: {
              active: true
            }
          }
        },
        {
          mediaType: {
            in: [TMDBMediaTypeEnum.MOVIE, TMDBMediaTypeEnum.TV]
          }
        }
      ]
     };

    if (mediaItemId) {
      where = {
        AND: [
          where, 
          {
            id: {
              not: mediaItemId
            }
          }
        ]
      }
    }
    let mediaItems = await prisma.mediaItem.findMany({
      where: where,
      take: this.DEFAULT_GROUP_PAGE_SIZE,       
    });

    let mediaItem: MediaItem|null = null;
    if (mediaItemId) {
      mediaItem = await prisma.mediaItem.findFirst({where: {id: mediaItemId}});
    }

    const configuration = await metaDataService.getConfiguration();

    let redisMediaItems: IRedisMediaItemInfo[] = mediaItems.map(mediaItemDb => {
      let redisMediaItem: IRedisMediaItemInfo = 
          this.convertMediaItemToRedisMediaItem(mediaItemDb, [], [], configuration);
      return redisMediaItem;
    })
    
    let allGenres: string[] = [];
    redisMediaItems.forEach(itm => {
      let genres = itm.genres ?? [];
      allGenres =  allGenres.concat((genres).filter((item) => allGenres.indexOf(item) < 0));
    })

    if (mediaItem) {
      const genreArrs = JSON.parse(mediaItem.genres ?? '[]') ?? [];
      if (genreArrs.length) {
        const genre = genreArrs[0];
        if (genre) {
          allGenres = allGenres.map(g => {
            const item = {
              genre: g,
              displayOrder: g === genre ? 1: 10
            }
            return item;
          })?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})
          .map(x => x.genre);
        }          
      }        
    }

    allGenres.forEach(genre => {
      const mediaItems = redisMediaItems.filter(x => (x.genres ?? []).includes(genre));
      if (mediaItems.length) {
        const group: IRedisGenreGroupMediaItem = {
          genre: genre,
          items: mediaItems
        };
        result.groups.push(group);
        redisMediaItems = redisMediaItems.filter(mediaItem => !mediaItems.some(x => x.id === mediaItem.id));
      }
      
    })

    return result;
  }

  public getUserMediaWatchList = async (token: string): Promise<IMediaShortInfo[]> => {
    const userProvider = await accountService.getUserProviderByToken(token);
    if (!userProvider) {
      return [];
    }

    const where: Prisma.UserMediaWatchListWhereInput = {
      userId: userProvider.userId
    };

    const include: Prisma.UserMediaWatchListInclude = {
      mediaItem: true
    };

    let userMediaWatchLists = await prisma.userMediaWatchList.findMany({
      where,
      include,
      orderBy: {  createdAt: "desc"}
    });

    if (!userMediaWatchLists?.length) {
      return [];
    }
    
    const configuration = await metaDataService.getConfiguration();
    const results = userMediaWatchLists.map((item: any) => this.convertMediaToMediaShortInfo(item.mediaItem, configuration));
   
    return results;
  };

  public searchMedia = async (query: string, offset: number, token?: string): Promise<IBaseScrollResponse<IUserMediaInfo>> => {
    offset = offset <= 0 ? 0: offset;
    let result: IBaseScrollResponse<IUserMediaInfo> = {
      hasMoreItem: false,
      results: []
    };
    const pageSize = this.DEFAULT_PAGE_SIZE + 1;
   
    let mediaItems = await this.searchCommonMediaItems(query, offset, pageSize, false, '', ClixSearchType.TITLE, []);
    if (!mediaItems.length) {
      return result;
    }

    if (mediaItems.length > this.DEFAULT_PAGE_SIZE) {
      mediaItems = mediaItems.slice(0, this.DEFAULT_PAGE_SIZE);
      result.hasMoreItem = true;
    }

    const configuration = await metaDataService.getConfiguration();
    const mediaItemIds = mediaItems.map(x => x.id);
    
    let userMediaStatuses: IUserMediaInfoStatus[] = [];
    if (token) {      
      userMediaStatuses = await this.getV2UserMediaStatuses(token, mediaItemIds);
    }
    
    
    result.results = mediaItems.map(mediaDb => 
      {
        let item: IUserMediaInfo = {
          info: this.convertMediaToMediaShortInfo(mediaDb, configuration)
        };
        if (token && userMediaStatuses.length) {
          const userMediaStatus = userMediaStatuses.filter(x => x?.mediaItemId === mediaDb.id)[0];
          item.status = {
            isExistWatchList: userMediaStatus?.isExistWatchList ?? false,
            rate: userMediaStatus.rate
          };
        }
        
        return item;
      });

    return result;
  };

  public getMediaItemForListNames = async (query: string, offset: number, excepMediaItemIds?: string[]): Promise<IBaseScrollResponse<IMediaShortInfo>> => {
    offset = offset <= 0 ? 0: offset;

    let result: IBaseScrollResponse<IMediaShortInfo> = {
      hasMoreItem: false,
      results: []
    };

    excepMediaItemIds = excepMediaItemIds ?? [];
    const pageSize = this.DEFAULT_PAGE_SIZE + 1;
    
    let mediaItems = await this.searchCommonMediaItems(query, offset, pageSize, false, '', ClixSearchType.ALL, []);
    if (!mediaItems.length) {
      return result;
    }
    
    if (mediaItems.length > this.DEFAULT_PAGE_SIZE) {
      mediaItems = mediaItems.slice(0, this.DEFAULT_PAGE_SIZE);
      result.hasMoreItem = true;
    }

    const mediaItemIds = mediaItems.map(x => x.id);
    const allWatchProviders = await prisma.mediaWatchProvider.findMany({
      where: {
        mediaItemId: {
          in: mediaItemIds
        }
      }
    });

    const tmdbMediaItemChanges = await mediaTmdbSyncService.getTmdbChangeByTitleIds(mediaItemIds);

    const configuration = await metaDataService.getConfiguration();
    result.results = mediaItems.map(mediaDb => {
      const watchProviders = allWatchProviders.filter(x => x.mediaItemId === mediaDb.id);
      const item = this.convertMediaToMediaShortInfo(mediaDb, configuration, watchProviders, undefined, true);
      item.hasTmdbChange = tmdbMediaItemChanges.some(x => x.mediaItemId === mediaDb.id);
      return item;
    });
    
    
    return result;
  };

  public getImporteds = async (page: number, query: string, searchType: ClixSearchType, genre?: string): Promise<IBaseResponse<IMediaShortInfo>> => {
    let result: IBaseResponse<IMediaShortInfo> = {
      page: page,
      results: [],
      totalPages: 0,
      totalResults: 0
    };

    // const total = await this.countMediaItems(query, searchType, genre);
    let total = await this.countCommonMediaItems(query, false, genre ?? '', searchType ?? ClixSearchType.TITLE);

    result.totalResults = Number(total);
    result.totalPages = Number(total) % this.DEFAULT_PAGE_SIZE == 0 
        ? Number(total)/this.DEFAULT_PAGE_SIZE 
        : ~~(Number(total)/this.DEFAULT_PAGE_SIZE) + 1;

    if( (page - 1) * this.DEFAULT_PAGE_SIZE >= total) {
      return result;
    }

    const skip = (page - 1) * this.DEFAULT_PAGE_SIZE;

    const include: Prisma.MediaItemInclude = {
      mediaCreditItems: true,
      mediaWatchProviders: true
    };
    
    let mediaItems = await this.searchCommonMediaItems(query, skip, this.DEFAULT_PAGE_SIZE, false, genre ?? '', searchType ?? ClixSearchType.TITLE, []);
    if (!mediaItems.length) {
      return result;
    }

    if (!mediaItems.length) {
      return result;
    }

    const mediaItemIds = mediaItems.map(x => x.id);
    const [allWatchProviders, allCrediaItems] = await Promise.all([
      prisma.mediaWatchProvider.findMany({
        where: {
          mediaItemId: {
            in: mediaItemIds
          }
        }
      }),
      prisma.mediaCreditItem.findMany({
        where: {
          mediaItemId: {
            in: mediaItemIds
          }
        }
      })
    ]);


    const configuration = await metaDataService.getConfiguration();
    result.results = mediaItems.map(mediaDb => {
      const mediaItem: MediaItem = Object.assign({}, mediaDb);
      const watchs = allWatchProviders.filter(x => x.mediaItemId === mediaDb.id);
      
      const creditItems = allCrediaItems.filter(x=> x.creditType === TMDBCreditEnum.CAST && x.mediaItemId === mediaDb.id);

      let mediaShortInfo = this.convertMediaToMediaShortInfo(mediaItem, configuration);

      if (watchs?.length) {
        mediaShortInfo.watchProviders = watchs.map(watch => {
          let item: IMediaWatchProviderInfo = {
            id: watch.id,
            link: watch.link,
            logoPath: watch.logoPath,
            providerId: watch.providerId,
            providerName: watch.providerName,
            isSelected: watch.isSelected ?? false
          };
  
          if (item.logoPath && !isAbsolutePath(item.logoPath)) {
            item.logoPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.logoPath}`;
          }
          return item;
        });
       }
  
       if (creditItems?.length) {
        mediaShortInfo.casts = creditItems.map(cast => {
          let item: IMediaCastInfo = {
            adult: cast.adult,
            gender: cast.gender,
            knownDepartment: cast.knownDepartment,
            name: cast.name,
            profilePath: cast.profilePath,
          };
          if (item.profilePath) {
            item.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.profilePath}`;
          }
          return item;
        });
       }

      return mediaShortInfo;
    });

    return result;
};

  public getMovies = async (page: number, query: string): Promise<IBaseResponse<IMediaShortInfo>> => {
      const tmdbResults = await searchMovies(page, query);
      const result = await this.convertTmpdbToBaseResponse(tmdbResults, TMDBMediaTypeEnum.MOVIE);

      return result;
  };
  
  public getTvs = async (page: number, query: string): Promise<IBaseResponse<IMediaShortInfo>> => {
    const tmdbResults = await searchTvs(page, query);
    const result = await this.convertTmpdbToBaseResponse(tmdbResults, TMDBMediaTypeEnum.TV);

    return result;
  };

  public updateVisibleMedia =async (mediaItemId: string, isVisible: boolean): Promise<void> => {
    const update: Prisma.MediaItemUpdateArgs = {
      where: {
        id: mediaItemId
      },
      data: {
        active: isVisible,
        updatedAt: new Date()
      }
    };
    
    await prisma.mediaItem.update(update);

    await redisService.updateVisibleMediaInListName(mediaItemId, isVisible);
  }

  public deleteMediaItemByIds =async (ids: string[]): Promise<void> => {    
    const whereListNameItem: Prisma.MediaListNameItemWhereInput = {
      mediaItemId: {
        in: ids
      }
    };
    await prisma.mediaListNameItem.deleteMany({ where: whereListNameItem });

    const whereAdditionalItem: Prisma.MediaAdditionalItemWhereInput = {
      mediaItemId: {
        in: ids
      }
    };
    await prisma.mediaAdditionalItem.deleteMany({ where: whereAdditionalItem });

    const whereCreditItem: Prisma.MediaCreditItemWhereInput = {
      mediaItemId: {
        in: ids
      }
    };
    await prisma.mediaCreditItem.deleteMany({ where: whereCreditItem });

    const whereWatchProvider: Prisma.MediaWatchProviderWhereInput = {
      mediaItemId: {
        in: ids
      }
    };
    await prisma.mediaWatchProvider.deleteMany({ where: whereWatchProvider });

    const whereReview: Prisma.MediaReviewItemWhereInput = {
      mediaItemId: {
        in: ids
      }
    };

    await prisma.mediaReviewItem.deleteMany({ where: whereReview });
    await prisma.mediaItemCompareSync.deleteMany({ 
      where: {
        mediaItemId: {
          in: ids
        }
      } 
    });
    await prisma.userMediaWatchList.deleteMany({ 
      where: {
        mediaItemId: {
          in: ids
        }
      }
     });

     await prisma.userMediaAnswer.deleteMany({ 
      where: {
        userMediaQuestionaire: {
          mediaItemId: {
            in: ids
          }
        }
      }
     });

     await prisma.userMediaQuestionaire.deleteMany({ 
      where: {
        mediaItemId: {
          in: ids
        }
      }
     });

    await prisma.userMediaStat.deleteMany({ 
      where: {
        mediaItemId: {
          in: ids
        }
      }
    });

    await prisma.userGenreMediaRoundGame.deleteMany({ 
      where: {
        mediaItemId: {
          in: ids
        }
      }
    });

    const whereMediaItem: Prisma.MediaItemWhereInput = {
      id: {
        in: ids
      }
    };
    await prisma.mediaItem.deleteMany({ where: whereMediaItem });

    await redisService.deleteMediaInListByIds(ids);
  }

  public resyncMediaItems = async (): Promise<void> => {
    let mediaItems = await prisma.mediaItem.findMany();

    for(let index = 0; index < mediaItems.length; index ++) {
      await this.processSyncTmdbToDb(mediaItems[index]);
    }
  };

  public importMedias = async (tmdbIds: number[], code: string): Promise<void> => {
    if (!tmdbIds?.length) {
      return;
    }

    if (code !== TMDBMediaTypeEnum.MOVIE && code !== TMDBMediaTypeEnum.TV) {
      return;
    }

    //re-filter - remove item have sync
    {
      const mediaDbs = await this.getPrismaMediaByTmdpIds(tmdbIds, code);
      const exceptTmdbIds = mediaDbs.map(x => x.tmdbId);

      tmdbIds = tmdbIds.filter(id => !exceptTmdbIds.includes(id));
      if (!tmdbIds.length) {
        return;
      }
    }

    let allTmdbIds: number[] = [];
    allTmdbIds = allTmdbIds.concat(tmdbIds);

    // const allRecommendations: any[] = [];
    // for(let index = 0; index < tmdbIds.length; index++) {
    //   let id = tmdbIds[index];
    //   const recommendations = await getTmdbRecommendations(id, code);
    //   const recommendationIds = recommendations.map(x => x.id);

    //   allTmdbIds =  allTmdbIds.concat(recommendationIds.filter((item) => allTmdbIds.indexOf(item) < 0));
    //   allRecommendations.push({
    //     id: id,
    //     recommendationIds: JSON.stringify(recommendationIds ?? [])
    //   })
    // }

    // //re-filter again- remove item have sync
    // {
    //   const mediaDbs = await this.getPrismaMediaByTmdpIds(allTmdbIds, code);
    //   const exceptTmdbIds = mediaDbs.map(x => x.tmdbId);

    //   allTmdbIds = allTmdbIds.filter(id => !exceptTmdbIds.includes(id));
    //   if (!allTmdbIds.length) {
    //     return;
    //   }
    // }

    if (code === TMDBMediaTypeEnum.MOVIE) {
      const tasks = allTmdbIds.map(tmdbId => {
        const task = this.processImportTmdbToDb(tmdbId, code, '[]');
        return task;
      });
      await Promise.all(tasks);
    } else {
      for(let index = 0; index < allTmdbIds.length; index++) {
        await this.processImportTmdbToDb(allTmdbIds[index], code, '[]');
      }
    }
    
  };

  public getMediaDetail = async (mediaItemId: string, isFetchAllData?: bool): Promise<IMediaShortInfo | undefined> => {
    const where: Prisma.MediaItemWhereInput = {id: mediaItemId};

    const include: Prisma.MediaItemInclude = {
      mediaAdditionalItems: true,
      mediaCreditItems: true,
      mediaWatchProviders: true
    };

    const mediaDb = await prisma.mediaItem.findFirst({ 
      where, 
      include,
     });

     if (!mediaDb) {
      return undefined;
     }
     
     const mediaItem: MediaItem = Object.assign({}, mediaDb);
     const additionalItems = mediaDb?.mediaAdditionalItems ?? [];
     const creditItems = mediaDb?.mediaCreditItems?.filter(x=> x.creditType === TMDBCreditEnum.CAST);
     const directors = mediaDb?.mediaCreditItems?.filter(x=> x.job === TMDBCreditJobEnum.DIRECTOR 
        || x.job === TMDBCreditJobEnum.WRITER);
     const watchs = mediaDb?.mediaWatchProviders;

     const configuration = await metaDataService.getConfiguration();
     let result = this.convertMediaToMediaShortInfo(mediaItem, configuration, watchs);

     if (mediaItem.backdropPath && !isAbsolutePath(mediaItem.backdropPath)) {
      result.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.ORIGINAL}${mediaItem.backdropPath}`;
     }
      
     if (mediaItem.posterPath && !isAbsolutePath(mediaItem.posterPath)) {
      result.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.ORIGINAL}${mediaItem.posterPath}`;
     }
     
     
     if (additionalItems?.length) {
      result.videos = additionalItems
          .filter(item => !!isFetchAllData
            || (item.source === MediaDetailSourceEnum.CLIX || item.site === TMDBAdditionalSiteEnum.CLIX))
          .map(add => {
            let item: IMediaAdditionalInfo = {
              key: add.key,
              site: add.site,
              name: add.name,
              active: add.active,
              source: add.source ?? MediaDetailSourceEnum.CLIX,
              thumbnailUrl: add.thumbnailUrl ?? '',
              mostPopular: add.mostPopular ?? false,
              isSelected: add.isSelected ?? false
            };
            return item;
          });
     }

     if (!!isFetchAllData && result.videos?.length) {
      const activeVideos = additionalItems.filter(x => x.active);
      const trailerVideo = transformTrailerMedia(activeVideos);
      const gameVideo = transformGameMedia(activeVideos);

      let videos: IMediaAdditionalInfo[] = activeVideos.map(vid => {
          const item: IMediaAdditionalInfo = {
            ...vid,
            thumbnailUrl: vid.thumbnailUrl ?? '',
            source: vid.source ?? MediaDetailSourceEnum.CLIX,
            displayOrder: transformMediaDisplayOrder(vid.name, vid.source ?? MediaDetailSourceEnum.CLIX, vid.mostPopular ?? false, vid.isSelected ?? false),
            mostPopular: false,
            isSelected: false,
            type: vid.key === trailerVideo?.key && vid.site === trailerVideo?.site
              ? ClixTitleVideoType.TRAILER
              : vid.key === gameVideo?.key && vid.site === gameVideo?.site
                ? ClixTitleVideoType.GAME
                : ClixTitleVideoType.DEFAULT,
          };
          return item;
        }) ?? [];

        if (videos.length && gameVideo && !videos.some(x => x.type === ClixTitleVideoType.GAME)) {
          const item: IMediaAdditionalInfo = {
            ...gameVideo,
            source: gameVideo.source ?? MediaDetailSourceEnum.CLIX,
            mostPopular: false,
            isSelected: false,
            type: ClixTitleVideoType.GAME,
            active: false
          };

          videos.push(item);
        }

        videos = videos?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});

      result.videos = videos ?? [];
     }

     if (directors?.length) {
      result.directors = directors
        .sort(function(a: any, b: any) {return (a.order ?? 0) - (b.order ?? 0)})
        .map(cast => {
        let item: IMediaCastInfo = {
          adult: cast.adult,
          gender: cast.gender,
          knownDepartment: cast.job ?? cast.knownDepartment,
          name: cast.name,
          profilePath: cast.profilePath,
        };
        if (item.profilePath) {
          item.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.profilePath}`;
        }
        return item;
      });
     }
     if (creditItems?.length) {
      result.casts = creditItems
      .sort(function(a: any, b: any) {return (a.order ?? 0) - (b.order ?? 0)})
      .map(cast => {
        let item: IMediaCastInfo = {
          adult: cast.adult,
          gender: cast.gender,
          knownDepartment: cast.knownDepartment,
          name: cast.name,
          profilePath: cast.profilePath,
        };
        if (item.profilePath) {
          item.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.profilePath}`;
        }
        return item;
      });
     }
     
     return result;
  };

  public getTmdbMediaDetail = async (mediaItemId: string): Promise<IMediaShortInfo | undefined> => {
    const mediaItem = await prisma.mediaItem.findFirst({
      where: { id: mediaItemId }
    });

    if (!mediaItem) {
      return undefined;
    }
    const { mediaType, tmdbId } = mediaItem;
    
    const tmdbDetailResponse = mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getMovieDetail(tmdbId)
      : await getTvDetail(tmdbId);

    if (!tmdbDetailResponse) {
      return;
    }

    const tmdbCastsResponse = mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getTmdbMovieCredit(tmdbId)
      : await getTmdbTvCredit(tmdbId);

    const tmdbWatchProvidersResponse = mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getMovieWatchProviderDetail(tmdbId)
      : await getTvWatchProviderDetail(tmdbId);

    const configuration = await metaDataService.getConfiguration();
    let result = await this.convertTmpdbToMediaDetailResponse(mediaItemId, tmdbDetailResponse, tmdbCastsResponse, tmdbWatchProvidersResponse, configuration, mediaType);

    result.customReleaseDate = mediaItem.customReleaseDate ?? undefined;

    const genreArrs = JSON.parse(mediaItem.genres ?? '[]') ?? [];
    const genre = genreArrs[0];
    if (genre) {
      const tmdbGenres = result.genres;
      if (tmdbGenres?.includes(genre)) {
        result.genre = genre;
      }
    }
    return result;
  };

  public updateMedia = async (request: IUpdateMediaRequest): Promise<void> => {
    const mediaItem = await prisma.mediaItem.findFirst({
      where: { id: request.id }
    });

    if (!mediaItem) {
      return;
    }

    if (request.selectedGenre) {
      mediaItem.genres = this.sortGenres(mediaItem.genres ?? '', request.selectedGenre);
    }

    const releaseDate = request.customReleaseDate
      ? new Date(request.customReleaseDate)
      : null;
      
    if (request.posterPath 
        || request.name 
        || request.overview 
        || request.tags?.length
        || request.selectedGenre) {
      let dataUpdate: Prisma.MediaItemUpdateInput = {
        updatedAt: new Date()
      };
  
      if (request.posterPath) {
        dataUpdate.posterPath = request.posterPath;
      }
      if (request.name) {
        dataUpdate.name = request.name;
      }
      if (request.overview) {
        dataUpdate.overview = request.overview;
      }
      if (request.tags?.length) {
        dataUpdate.tags = JSON.stringify(request.tags);
      }

      if (request.selectedGenre) {
        dataUpdate.genres = mediaItem.genres;
      }

      dataUpdate.customReleaseDate = releaseDate;

      const update: Prisma.MediaItemUpdateArgs = {
        where: {
          id: request.id
        },
        data: dataUpdate
      };
      
      await prisma.mediaItem.update(update);

      if (request.tags?.length) {
        await metaDataService.updateTags(request.tags);
      }      
      
    }

    const allProviderIds = request.providers?.map(x => x.id) ?? [];
    const selectedProvider = request.providers?.filter(x => x.isSelected)[0];

    await prisma.mediaWatchProvider.deleteMany({
      where: {
        AND: [
          { mediaItemId: request.id },
          {
            providerId: {
              notIn: allProviderIds
            }
          }
        ]
      }
    });

    await prisma.mediaWatchProvider.updateMany({
      where: {
        mediaItemId: request.id
      },
      data: {
        updatedAt: new Date(),
        isSelected: false
      }
    });

    if (allProviderIds.length) {
      const existWatchProviderDbs = await prisma.mediaWatchProvider.findMany({
        where: {
          AND: [
            {
              providerId: {
                in: allProviderIds
              }
            },
            { mediaItemId: request.id }
          ]
        }
      });

      const existWatchProviderIdDbs = existWatchProviderDbs.map(x => x.providerId);

      let customProviderIds = allProviderIds.filter(x => !existWatchProviderIdDbs.some(y => y === x));
      if (customProviderIds.length) {
        const redisProviders = await metaDataService.getStreamers();
        const newWatchProviders: MediaWatchProvider[] =[];
        customProviderIds.forEach(providerId => {
          const redisWatchProvider = redisProviders.filter(x => x.providerId === providerId)[0];
          const requestProvider = request.providers?.filter(x => x.id === providerId)[0];
          if (redisWatchProvider) {
            const item: MediaWatchProvider = {
              createdAt: new Date(),
              id: v4(),
              isSelected: false,
              link: requestProvider?.link ?? null,
              logoPath: redisWatchProvider.logoPath,
              mediaItemId: request.id,
              providerId: redisWatchProvider.providerId,
              providerName: redisWatchProvider.providerName,
              tmdbId: mediaItem.tmdbId,
              updatedAt: new Date()
            };

            newWatchProviders.push(item);
          }
        });
        
        if (newWatchProviders.length) {
          await prisma.mediaWatchProvider.createMany({data: newWatchProviders});
        }
      }
    }

    // will remove field: selectedProviderId later
    if (selectedProvider) {
      const whereWatchProvider = {
        AND: [
          {
            mediaItemId: request.id
          },
          {
            providerId: selectedProvider.id
          }
        ]
      };
      
      await prisma.mediaWatchProvider.updateMany({
        where: whereWatchProvider,
        data: {
          link: selectedProvider.link,
          isSelected: true,
          updatedAt: new Date()
        }
      });
    }

    
    await this.updateMediaAdditionalVideos(mediaItem, request.additionalVideos ?? []);   

    const videos = await prisma.mediaAdditionalItem.findMany({
      where: {
        mediaItemId: mediaItem.id
      }
    });
    
    const watchProviders = await prisma.mediaWatchProvider.findMany({
      where: { mediaItemId: request.id }
    });
    
    const genreArrs = JSON.parse(mediaItem.genres ?? '[]') ?? [];
    let redisMediaItem: IRedisMediaItemInfo = {
      active: mediaItem.active,
      backdropPath: mediaItem.backdropPath ?? "",
      posterPath: request.posterPath ?? mediaItem.posterPath ?? "",
      id: mediaItem.id,
      genres: genreArrs,
      genre: genreArrs[0],
      watchProvider: transformSelectedWatchProvider(watchProviders),
      videos: transformRedisTitleVideos(videos),
      name: mediaItem.name,
      mediaType: mediaItem.mediaType,
      score: SCORE_DEFAULT,
      clixScore: convertToTmdbScore(mediaItem.voteAverage),
      ads3rdUrl: mediaItem.ads3rdUrl ?? '',
      customReleaseDate: releaseDate ?? undefined,      
    };
    const configuration = await metaDataService.getConfiguration();
    if (redisMediaItem.backdropPath && !isAbsolutePath(redisMediaItem.backdropPath)) {
      redisMediaItem.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.backdropPath}`;
    }
    if (redisMediaItem.posterPath && !isAbsolutePath(redisMediaItem.posterPath)) {
      redisMediaItem.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.posterPath}`;
    }

    await redisService.updateMediaInListName(redisMediaItem);
  };

  public updateMediaAdditionalVideos = async (mediaItem: MediaItem, requestVideos: IMediaAdditionalRequest[]): Promise<MediaAdditionalItem|undefined>  => {
    if (mediaItem.mediaType !== TMDBMediaTypeEnum.MOVIE && mediaItem.mediaType !== TMDBMediaTypeEnum.TV) {
      return undefined;
    }
    if (mediaItem.tmdbId <= 0) {
      return undefined;
    }

    const tmdbVideos = mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getTmdbMovieVideos(mediaItem.tmdbId)
      : await getTmdbTvVideos(mediaItem.tmdbId);

    const mostPopularVideos = tmdbVideos.filter(x => x.type === TMDBAdditionalTypeEnum.TRAILER) ?? [];
    let mostPopularVideo = mostPopularVideos.length
      ? mostPopularVideos[mostPopularVideos.length - 1]
      : undefined;
      
    if (!mostPopularVideo) {
      let videoLength = tmdbVideos?.length - 1;
      videoLength = videoLength <= 0 ? 0: videoLength;
      mostPopularVideo = tmdbVideos[videoLength];
    }

    let videos: MediaAdditionalItem[] = [];
    for(let index = 0; index < requestVideos?.length; index++) {
      const add = requestVideos[index];
      const tmdbVideo = tmdbVideos.filter(x => x.key === add.key && x.site === add.site)[0];
      const item: MediaAdditionalItem = {
        createdAt: new Date(),
        id: v4(),
        key: add.key,
        mediaItemId: mediaItem.id,
        name: tmdbVideo?.name ?? add.name ?? "",
        site: tmdbVideo?.site ?? (add.site ?? TMDBAdditionalSiteEnum.CLIX),
        tmdbId: mediaItem.tmdbId,
        active: add.active,
        source: tmdbVideo ? MediaDetailSourceEnum.TMDB : MediaDetailSourceEnum.CLIX,
        isSelected: add.isSelected ?? false,
        updatedAt: new Date(),
        mostPopular: mostPopularVideo?.key === add.key && add.source === MediaDetailSourceEnum.TMDB,
        type: tmdbVideo?.type ?? '',
        thumbnailUrl: await getThumbnailUrl(add.site ?? TMDBAdditionalSiteEnum.CLIX, add.key)
      };
      videos.push(item);
    }
    
    for(let index = 0; index < tmdbVideos.length; index++) {
      const tmdbVideo = tmdbVideos[index];
      if (!videos.some(x => x.key === tmdbVideo.key && x.site == tmdbVideo.site))
      {
        const item: MediaAdditionalItem = {
          createdAt: new Date(),
          id: v4(),
          key: tmdbVideo.key,
          mediaItemId: mediaItem.id,
          name: tmdbVideo?.name ?? "",
          site: tmdbVideo?.site  ?? TMDBAdditionalSiteEnum.CLIX,
          tmdbId: mediaItem.tmdbId,
          active: true,
          source: tmdbVideo ? MediaDetailSourceEnum.TMDB : MediaDetailSourceEnum.CLIX,
          isSelected: false,
          updatedAt: new Date(),
          mostPopular: mostPopularVideo?.key === tmdbVideo.key,
          type: tmdbVideo?.type ?? '',
          thumbnailUrl: await getThumbnailUrl(tmdbVideo.site, tmdbVideo.key)
        };
        videos.push(item);
      }     
    }
    
    await prisma.mediaAdditionalItem.deleteMany({
      where: {
        mediaItemId: mediaItem.id 
      }
    });

    if (videos.length) {    
      if (!videos.some(x => !!x.isSelected)) {
        const videoSelected = videos.map(vid => {
          const item = {
            id: vid.id,
            displayOrder: transformMediaDisplayOrder(vid.name, vid.source ?? MediaDetailSourceEnum.CLIX, vid.mostPopular ?? false, vid.isSelected ?? false)
          };
          return item;
        })?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})[0];

        if (videoSelected) {
          videos.forEach(vid => {
            if (vid.id === videoSelected.id) {
              vid.isSelected = true;
            }
          })
        }        
      }
      await prisma.mediaAdditionalItem.createMany({data: videos});
    }

    const videoShorts = videos?.filter(x => x.active).map(vid => {
      const item: any = {
        id: vid.id,
        displayOrder: transformMediaDisplayOrder(vid.name, vid.source ?? MediaDetailSourceEnum.CLIX, vid.mostPopular ?? false, vid.isSelected ?? false)
      };
      return item;
    });

    const videoShortSelected = videoShorts
        ?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder})[0];

    if (videoShortSelected) {
      const result = videos.filter(x => x.id === videoShortSelected.id) [0];
      return result;
    }

    return undefined;
  }

  public updateMediaCredits = async (mediaItem: MediaItem): Promise<void>  => {
    if (mediaItem.mediaType !== TMDBMediaTypeEnum.MOVIE && mediaItem.mediaType !== TMDBMediaTypeEnum.TV) {
      return undefined;
    }
    if (mediaItem.tmdbId <= 0) {
      return undefined;
    }
    const tmdbShortInfo:ITmdbMediaShortInfo = {
      created_by: [],
      id: mediaItem.tmdbId,
      overview: '',
    };
    try {
      const mediaCredits = await this.getCreditsByTmdbId(mediaItem.tmdbId, tmdbShortInfo, mediaItem.id, mediaItem.mediaType);

      await prisma.mediaCreditItem.deleteMany({
        where: {
          mediaItemId: mediaItem.id
        }
      });
  
      await prisma.mediaCreditItem.createMany({
        data: mediaCredits
      });
    } catch (err) {
      console.log(err);
    }
  }

  public updateMediaStreamer = async (request: IUpdateMediaStreamerRequest): Promise<void> => {
    await prisma.mediaWatchProvider.updateMany({
      where: {
        mediaItemId: request.id
      },
      data: {
        updatedAt: new Date(),
        isSelected: false
      }
    });
    
    await prisma.mediaWatchProvider.updateMany({
      where: {
        AND: [
          {
            mediaItemId: request.id
          },
          {
            providerId: request.selectedProviderId
          }
        ]
      },
      data: {
        updatedAt: new Date(),
        isSelected: true
      }
    });

    const watchProviderDbs = await prisma.mediaWatchProvider.findMany({
      where: {
        mediaItemId: request.id
      }
    });
    
    const listNameRedis = await redisService.getMediaListNames();
    for(let indexListName = 0; indexListName < listNameRedis.length; indexListName ++) {
      const listName = listNameRedis[indexListName];
      if (!listName.mediaItems?.length) {
        continue;
      }
      for(let indexMedia = 0; indexMedia < listName.mediaItems.length; indexMedia ++) {
        let mediaItem = listName.mediaItems[indexMedia];
        if (mediaItem.id === request.id) {
          mediaItem.watchProvider = transformSelectedWatchProvider(watchProviderDbs);

          await redisService.updateMediaInListName(mediaItem);
        }
      }
    }
  };

  public getUserMediaStatusByToken = async (token: string, mediaItemId: string): Promise<IUserMediaStatus|undefined> => {
    const userMediaStatuses = await this.getV2UserMediaStatuses(token, [mediaItemId]);
    const result: IUserMediaStatus = {
      isExistWatchList: userMediaStatuses[0]?.isExistWatchList ?? false,
      rate: userMediaStatuses[0]?.rate
    };
     return result;
  };

  
  public upsertWatchList = async (token: string, mediaItemId: string, isAddToWatchList: boolean): Promise<void> => {
    const userProvider = await accountService.getUserProviderByToken(token);
    if (!userProvider) {
      return;
    }

    const where: Prisma.UserMediaWatchListWhereInput = {
      AND: [
        {
          userId: userProvider.userId
        },
        {
          mediaItemId: mediaItemId
        },
      ]
    };

    if (!isAddToWatchList) {
      await prisma.userMediaWatchList.deleteMany({ where });
      return;
    }

    let userMediaWatchList = await prisma.userMediaWatchList.findFirst({where});
    if (userMediaWatchList) {
      return;
    }
    
    userMediaWatchList = {
      createdAt: new Date(),
      id: v4(),
      mediaItemId: mediaItemId,
      updatedAt: new Date(),
      userId: userProvider.userId,
    };
    
    await prisma.userMediaWatchList.create({data: userMediaWatchList});
  };

  public updateRecommendations = async (mediaItemIds: string[]): Promise<void> => {
    let mediaItems = await prisma.mediaItem.findMany({
      where: {
        id: {
          in: mediaItemIds
        }
      }
    });

    mediaItems = mediaItems.filter(x => {
      let recommends: string[] = JSON.parse(x.recommendationTmdbIds ?? '[]');
      return !recommends?.length;
    })

    if (!mediaItems.length) {
      return;
    }

    let movieTmdbIds: number[] = [];
    let tvTmdbIds: number[] = [];

    for(let index = 0; index < mediaItems.length; index ++) {
      let mediaItem = mediaItems[index];
      const recommendations = await getTmdbRecommendations(mediaItem.tmdbId, mediaItem.mediaType);
      const tmdbIds: number[] = recommendations.map(x => x.id);

      await prisma.mediaItem.update({
        where: {
          id: mediaItem.id
        },
        data: {
          updatedAt: new Date(),
          recommendationTmdbIds: JSON.stringify(tmdbIds ?? [])
        }
      });

      if (mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE) {
        movieTmdbIds = movieTmdbIds.concat(tmdbIds).filter((value, index, self) => self.indexOf(value) === index);
      } else {
        tvTmdbIds = tvTmdbIds.concat(tmdbIds).filter((value, index, self) => self.indexOf(value) === index);
      }
    }

    await Promise.all([
      this.checkAndImportMediaItemsByIds(movieTmdbIds, TMDBMediaTypeEnum.MOVIE),
      this.checkAndImportMediaItemsByIds(tvTmdbIds, TMDBMediaTypeEnum.TV)
    ]);
  };

  public syncRecommendationInList = async (): Promise<void> =>  {
    const mediaItemLists = await prisma.mediaListNameItem.findMany();
    const mediaItemIds: string[] = mediaItemLists.map(x => x.mediaItemId).filter((value, index, self) => self.indexOf(value) === index);
    
    await this.updateRecommendations(mediaItemIds);
  }

  private checkAndImportMediaItemsByIds = async (tmdbIds: number[], code: string): Promise<void> =>  {
    if (!tmdbIds.length) {
      return;
    }
    const mediaItems = await prisma.mediaItem.findMany({
      where: {
        AND: [
          {
            tmdbId: {
              in: tmdbIds
            }
          },
          {
            mediaType: code
          }
        ]
      }
    });

    const tmdbIdExists = mediaItems.map(x => x.tmdbId);
    const tmdbIdInserts = tmdbIds.filter(x => !tmdbIdExists.includes(x));
    if (!tmdbIdInserts.length) {
      return;
    }

    const tasks = tmdbIdInserts.map(tmdbId => {
      const task = this.processImportTmdbToDb(tmdbId, code, '[]');
      return task;
    });
    await Promise.all(tasks);
  }

  private processImportTmdbToDb = async (tmdbId: number, code: string, recommendationJson: string): Promise<void> =>  {
    const tmdbDetailResponse = code === TMDBMediaTypeEnum.MOVIE
        ? await getMovieDetail(tmdbId)
        : await getTvDetail(tmdbId);

    if (!tmdbDetailResponse) {
      return;
    }

    const mediaItem = await this.transformTmdbMediaToMediaItem(tmdbDetailResponse, code, tmdbId, recommendationJson);
    
    const mediaCredits = await this.getCreditsByTmdbId(tmdbId, tmdbDetailResponse, mediaItem.id, code);
    const watchProviders = await this.getWatchProvidersByTmdbId(tmdbId, mediaItem.id, code);
    const reviews = await this.getReviewsByTmdbId(tmdbId, mediaItem.id, mediaItem.mediaType);

    await prisma.mediaItem.create({
      data: mediaItem
    });

    await this.updateMediaAdditionalVideos(mediaItem, []);    

    if (mediaCredits.length) {
      await prisma.mediaCreditItem.createMany({
        data: mediaCredits
      });
    }

    if (watchProviders.length) {
      await prisma.mediaWatchProvider.createMany({
        data: watchProviders
      });
    }

    if (reviews.length) {
      await prisma.mediaReviewItem.createMany({
        data: reviews
      });
    }

    const mediaItemFull = {...mediaItem, mediaWatchProviders: watchProviders};
    await mediaTmdbSyncService.processSyncTmdbTitle(mediaItemFull, false);
  }
  
  
  private processSyncTmdbToDb = async (mediaItem: MediaItem): Promise<void> =>  {
    const tmdbId = mediaItem.tmdbId;
    const tmdbDetailResponse = mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
        ? await getMovieDetail(tmdbId)
        : await getTvDetail(tmdbId);

    if (!tmdbDetailResponse) {
      return;
    }

    const keywords = mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getTmdbMovieKeywords(tmdbId)
      : await getTmdbTvKeywords(tmdbId);
    
    const socialInfos = mediaItem.mediaType === TMDBMediaTypeEnum.MOVIE
      ? await getTmdbMovieExternals(tmdbId)
      : await getTmdbTvExternals(tmdbId);
    
    const update: Prisma.MediaItemUpdateArgs = {
      where: {
        id: mediaItem.id
      },
      data: {
        voteAverage: tmdbDetailResponse.vote_average ?? null,
        voteAveragePercent: this.voteAverageDisplay(tmdbDetailResponse.vote_average),
        budget: tmdbDetailResponse.budget || null,
        originalLanguage: tmdbDetailResponse.original_language ?? '',
        revenue: tmdbDetailResponse.revenue || null,
        tagline: tmdbDetailResponse.tagline ?? '',
        keywords: JSON.stringify(keywords || []),
        productionCountries: JSON.stringify(tmdbDetailResponse.production_countries ?? []),
        socialInfos: socialInfos ? JSON.stringify(socialInfos) : '',
        updatedAt: new Date()
      }
    };
    
    await prisma.mediaItem.update(update);

    const mediaCredits = await this.getCreditsByTmdbId(tmdbId, tmdbDetailResponse, mediaItem.id, mediaItem.mediaType);
    const watchProviders = await this.getWatchProvidersByTmdbId(tmdbId, mediaItem.id, mediaItem.mediaType);
    const reviews = await this.getReviewsByTmdbId(tmdbId, mediaItem.id, mediaItem.mediaType);

    await prisma.mediaCreditItem.deleteMany({
      where: {
        mediaItemId: mediaItem.id
      }
    });
    if (mediaCredits.length) {
      await prisma.mediaCreditItem.createMany({
        data: mediaCredits
      });
    }

    await prisma.mediaWatchProvider.deleteMany({
      where: {
        mediaItemId: mediaItem.id
      }
    });

    await prisma.mediaReviewItem.deleteMany({
      where: {
        mediaItemId: mediaItem.id
      }
    });

    if (watchProviders.length) {
      await prisma.mediaWatchProvider.createMany({
        data: watchProviders
      });
    }

    if (reviews.length) {
      await prisma.mediaReviewItem.createMany({
        data: reviews
      });
    }

    // sync to redis
    const videos = await prisma.mediaAdditionalItem.findMany({
        where: {
          mediaItemId: mediaItem.id
        }
    });
    
    
    const redisWatchProviders = watchProviders.map(w => {
      let itm: IRedisMediaWatchProviderInfo = {
        logoPath: w.logoPath,
        providerId: w.providerId ?? 0,
        providerName: w.providerName,
        isSelected: w.isSelected ?? false,
        bgColor: getBackgroundProvider(w.providerId ?? 0),
        link: w.link ?? ''
      }
      return itm;
    })

    let redisSelectedWatchProvider = redisWatchProviders.filter(x => x.isSelected)[0];
    if (!redisSelectedWatchProvider) {
      redisSelectedWatchProvider = redisWatchProviders[0];
    }

    const genreArrs = JSON.parse(mediaItem.genres ?? '[]') ?? [];
    let redisMediaItem: IRedisMediaItemInfo = {
      active: mediaItem.active,
      mediaType: mediaItem.mediaType,
      backdropPath: mediaItem.backdropPath ?? "",
      posterPath: mediaItem.posterPath ?? "",
      id: mediaItem.id,
      genres: genreArrs,
      genre: genreArrs[0],
      watchProvider: redisSelectedWatchProvider,
      videos: transformRedisTitleVideos(videos),
      name: mediaItem.name,
      score: SCORE_DEFAULT,
      clixScore: convertToTmdbScore(mediaItem.voteAverage),
      ads3rdUrl: mediaItem.ads3rdUrl ?? '',
      customReleaseDate: mediaItem.customReleaseDate ?? undefined
    };
    const configuration = await metaDataService.getConfiguration();
    if (redisMediaItem.backdropPath && !isAbsolutePath(redisMediaItem.backdropPath)) {
      redisMediaItem.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.backdropPath}`;
    }
    if (redisMediaItem.posterPath && !isAbsolutePath(redisMediaItem.posterPath)) {
      redisMediaItem.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.posterPath}`;
    }

    await redisService.updateMediaInListName(redisMediaItem);

  }

  private convertMediaItemToRedisMediaItem = (mediaItem: MediaItem, watchProviderDbs: MediaWatchProvider[], additionalItems: MediaAdditionalItem[], configuration: IConfiguration): IRedisMediaItemInfo => {
    const videos = transformRedisTitleVideos(additionalItems);
    const genreArrs = JSON.parse(mediaItem.genres ?? '[]') ?? [];
    let redisMediaItem: IRedisMediaItemInfo = {
      active: mediaItem.active,
      mediaType: mediaItem.mediaType,
      backdropPath: mediaItem.backdropPath ?? "",
      posterPath: mediaItem.posterPath ?? "",
      id: mediaItem.id,
      genres: JSON.parse(mediaItem.genres ?? '[]'),
      genre: genreArrs[0],
      watchProvider: transformSelectedWatchProvider(watchProviderDbs),
      name: mediaItem.name,
      score: SCORE_DEFAULT,
      clixScore: convertToTmdbScore(mediaItem.voteAverage),
      ads3rdUrl: mediaItem.ads3rdUrl ?? '',
      videos: transformRedisTitleVideos(additionalItems)
    };

    if (redisMediaItem.backdropPath && !isAbsolutePath(redisMediaItem.backdropPath)) {
      redisMediaItem.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.backdropPath}`;
    }
    if (redisMediaItem.posterPath && !isAbsolutePath(redisMediaItem.posterPath)) {
      redisMediaItem.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${redisMediaItem.posterPath}`;
    }
    return redisMediaItem;
  }
  private transformTmdbMediaToMediaItem= async (tmdbDetailResponse: ITmdbMediaShortInfo, code: string, tmdbId: number, recommendationJson: string) : Promise<MediaItem>=> {
    const genresArrs = tmdbDetailResponse.genres?.map(x => x.name) || [];
    const releaseDate = tmdbDetailResponse.release_date 
      ? new Date(tmdbDetailResponse.release_date)
      : tmdbDetailResponse.first_air_date
        ?  new Date(tmdbDetailResponse.first_air_date)
        : null;

    const keywords = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieKeywords(tmdbId)
        : await getTmdbTvKeywords(tmdbId);
      
    const keywordJsons = JSON.stringify(keywords || []);
  
    const socialInfos = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieExternals(tmdbId)
        : await getTmdbTvExternals(tmdbId);
      
    const socialInfoJsons = socialInfos ? JSON.stringify(socialInfos) : ''; 

    const certification = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieCertification(tmdbId)
        : await getTmdbTvCertification(tmdbId);

    const item: MediaItem = {
      active: true,
      backdropPath: tmdbDetailResponse.backdrop_path ?? "",
      createdAt: new Date(),
      genres: JSON.stringify(genresArrs),
      mediaType: code,
      name: tmdbDetailResponse.title ?? tmdbDetailResponse.name ?? "",
      overview: tmdbDetailResponse.overview ?? "",
      posterPath: tmdbDetailResponse.poster_path ?? "",
      releaseDate: releaseDate,
      customReleaseDate: null,
      status: tmdbDetailResponse.status ?? "",
      tmdbId,
      numberEpisodes: tmdbDetailResponse.number_of_episodes ?? null,
      numberSeasons: tmdbDetailResponse.number_of_seasons ?? null,
      runtime: tmdbDetailResponse.runtime 
        ? tmdbDetailResponse.runtime
        : tmdbDetailResponse.episode_run_time?.length
          ?  tmdbDetailResponse.episode_run_time.reduce((a, b) => a + b, 0)
          : null,
      voteAverage: tmdbDetailResponse.vote_average ?? null,
      voteAveragePercent: this.voteAverageDisplay(tmdbDetailResponse.vote_average),
      updatedAt: new Date(),
      tags: JSON.stringify([]),
      budget: tmdbDetailResponse.budget || null,
      originalLanguage: tmdbDetailResponse.original_language ?? '',
      revenue: tmdbDetailResponse.revenue || null,
      tagline: tmdbDetailResponse.tagline ?? '',
      keywords: keywordJsons,
      productionCountries: JSON.stringify(tmdbDetailResponse.production_countries ?? []),
      socialInfos: socialInfoJsons,
      certification: certification,
      recommendationTmdbIds: recommendationJson,
      ads3rdUrl: null,
      id: v4()
    };

    

    return item;
  }

  // private transformTmdbAdditionalToMediaAdditionalItem= (tmdbDetailResponse: ITmdbMediaShortInfo, mediaItemId: string, tmdbId: number) : MediaAdditionalItem[]=> {
  //   if (!tmdbDetailResponse?.videos?.results?.length) {
  //     return [];
  //   }

  //   let videoLength = tmdbDetailResponse.videos?.results?.length - 1;
  //   videoLength = videoLength <= 0 ? 0: videoLength;

  //   const mostPopularVideo = tmdbDetailResponse.videos?.results[videoLength];

  //   const results = tmdbDetailResponse.videos.results.map(tmdbVideo => {
  //     const additionalItem: MediaAdditionalItem = {
  //       createdAt: new Date(),
  //       id: v4(),
  //       key: tmdbVideo.key,
  //       mediaItemId: mediaItemId,
  //       name: tmdbVideo.name,
  //       site: tmdbVideo.site,
  //       tmdbId: tmdbId,
  //       active: true,
  //       source: MediaDetailSourceEnum.TMDB,
  //       updatedAt: new Date(),
  //       mostPopular: tmdbVideo.key === mostPopularVideo?.key,
  //       isSelected: tmdbVideo.key === mostPopularVideo?.key,
  //       type: tmdbVideo.type ?? ''
  //     };

  //     return additionalItem;
  //   });

  //   return results;
  // }

  
  private getReviewsByTmdbId = async (tmdbId: number, mediaItemId: string, code: string): Promise<MediaReviewItem[]> => {
    const reviews = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieReviews(tmdbId)
        : await getTmdbTvReviews(tmdbId);

    if (!reviews?.length) {
      return [];
    }   

    const results: MediaReviewItem[] = reviews.map(tmdbReview => {
      const item: MediaReviewItem = {
        author: tmdbReview.author,
        authorDetails: tmdbReview.author_details ? JSON.stringify(tmdbReview.author_details): '',
        content: tmdbReview.content,
        url: tmdbReview.url ?? '',
        createdAt: new Date(),
        id: v4(),
        mediaItemId: mediaItemId,
        updatedAt: new Date()
      };

      return item;
    });
    
    return results;
  }

  
  public getWatchProvidersByTmdbId = async (tmdbId: number, mediaItemId: string, code: string): Promise<MediaWatchProvider[]> => {
    const tmdbWatchProviderResponse = code === TMDBMediaTypeEnum.MOVIE
        ? await getMovieWatchProviderDetail(tmdbId)
        : await getTvWatchProviderDetail(tmdbId);

    let flatrates = tmdbWatchProviderResponse?.flatrate || [];
    let allItems = flatrates;

    if (!tmdbWatchProviderResponse) {
      return [];
    }
    const link = '';//tmdbWatchProviderResponse.link;
    const results = allItems.map(flat => this.transformTmdbWatchProviderToWatchProvider(link, mediaItemId, tmdbId, flat));
    
    if (results?.length) {
      results[0].isSelected = true;
    }
    
    return results;
  }

  
  private transformTmdbWatchProviderToWatchProvider= (link: string, mediaItemId: string, tmdbId: number, flatrace: ITmdbWatchProviderFlatrateResponse) : MediaWatchProvider=> {
    const item: MediaWatchProvider = {
      link: link,
      logoPath: flatrace.logo_path ?? "",
      providerId: flatrace.provider_id,
      providerName: flatrace.provider_name ?? "",
      tmdbId: tmdbId,
      id: v4(),
      mediaItemId: mediaItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSelected: false
    };
    return item;
  }

  private getCreditsByTmdbId = async (tmdbId: number, tmdbDetailResponse: ITmdbMediaShortInfo, mediaItemId: string, code: string): Promise<MediaCreditItem[]> => {
    const tmdbCreditResponse = code === TMDBMediaTypeEnum.MOVIE
        ? await getTmdbMovieCredit(tmdbId)
        : await getTmdbTvCredit(tmdbId);

        
    let results:MediaCreditItem[] = [];
    if (tmdbCreditResponse?.cast?.length) {
      tmdbCreditResponse.cast.forEach(tmdbCredit => {
        const item: MediaCreditItem = this.transformTmdbCreditToCredit(tmdbCredit, TMDBCreditEnum.CAST, mediaItemId, tmdbId);
        results.push(item);
      });      
    }

    if (tmdbCreditResponse?.crew?.length) {
      tmdbCreditResponse.crew.forEach(tmdbCredit => {
        const item: MediaCreditItem = this.transformTmdbCreditToCredit(tmdbCredit, TMDBCreditEnum.CREW, mediaItemId, tmdbId);
        results.push(item);
      });      
    }

    if (tmdbDetailResponse?.created_by?.length) {
      tmdbDetailResponse.created_by.forEach(tmdbCredit => {
        const item: MediaCreditItem = this.transformTmdbCreditToCredit(tmdbCredit, TMDBCreditEnum.CREW, mediaItemId, tmdbId);
        item.job = TMDBCreditJobEnum.CLIX_CUSTOM_DIRECTOR;
        results.push(item);
      });      
    }

    return results;
  }

  private transformTmdbCreditToCredit= (tmdbCredit: ITmdbCredit, creditType: string, mediaItemId: string, tmdbId: number) : MediaCreditItem=> {
    const item: MediaCreditItem = {
      adult: tmdbCredit.adult ?? true,
      creditType: creditType,
      department: tmdbCredit.department ?? "",
      gender: tmdbCredit.gender,
      job: tmdbCredit.job ?? "",
      knownDepartment: tmdbCredit.known_for_department ?? "",
      name: tmdbCredit.name,
      tmdbId: tmdbId,
      profilePath: tmdbCredit.profile_path ?? "",
      id: v4(),
      mediaItemId: mediaItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: tmdbCredit.order ?? null
    };
    return item;
  }

  public convertMediaToMediaShortInfo = (media: MediaItem, configuration: IConfiguration, watchProviders?: MediaWatchProvider[], additionalItems?: MediaAdditionalItem[], isKeepWatchLogo?: boolean ): IMediaShortInfo => {
    const genreArrs = JSON.parse(media.genres ?? "[]") ?? [];
    let result: IMediaShortInfo = {
      backdropPath: media.backdropPath ?? "",
      mediaType: media.mediaType,
      name: media.name,
      overview: media.overview ?? "",
      posterPath: media.posterPath ?? "",
      releaseDate: media.releaseDate ?? undefined,
      customReleaseDate: media.customReleaseDate ?? undefined,
      tmdbId: media.tmdbId,
      genres: genreArrs,
      genre: genreArrs[0],
      active: media.active,
      id: media.id,
      tags: JSON.parse(media.tags ?? "[]"),
      numberEpisodes: media.numberEpisodes ?? undefined,
      numberSeasons: media.numberSeasons ?? undefined,
      runtime: media.runtime ?? undefined,
      voteAverage: media.voteAverage ?? undefined,
      voteAveragePercent: this.voteAverageDisplay(media.voteAverage),
      certification: media.certification ?? '',
      score: SCORE_DEFAULT,
      clixScore: convertToTmdbScore(media.voteAverage),
      ads3rdUrl: media.ads3rdUrl ?? '',
      createdAt: media.createdAt
    };

    if (result.backdropPath && !isAbsolutePath(result.backdropPath)) {
      result.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${result.backdropPath}`;
    }
    if (result.posterPath && !isAbsolutePath(result.posterPath)) {
      result.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${result.posterPath}`;
    }

    if (watchProviders && watchProviders?.length) {
      result.watchProviders = watchProviders.map(watch => {
        const item: IMediaWatchProviderInfo = {
          id: watch.id,
          link: watch.link,
          logoPath: convertStreamerLogo(watch.logoPath, watch.providerId ?? 0, configuration, isKeepWatchLogo),
          providerId: watch.providerId,
          providerName: watch.providerName,
          isSelected: watch.isSelected ?? false
        };
        
        return item;
      });

      let watchProvider: IMediaWatchProviderInfo|undefined = result.watchProviders?.filter(x => x.isSelected)[0];
      if (!watchProvider) {
        watchProvider = result.watchProviders?.[0];
      }

      if (watchProvider) {
        result.watchProvider = {
          isSelected: true,
          logoPath: watchProvider.logoPath,
          providerId: watchProvider.providerId ?? 0,
          providerName: watchProvider.providerName ?? '',
          bgColor: getBackgroundProvider(watchProvider.providerId ?? 0),
          link: watchProvider.link ?? ''
        };
      }
    }

    if (!result.watchProvider) {
      result.watchProvider = createDefaultWatchProvider(configuration);
    }
    
    if (additionalItems?.length) {
      result.videos = additionalItems
          .map(add => {
            let item: IMediaAdditionalInfo = {
              key: add.key,
              site: add.site,
              name: add.name,
              active: add.active,
              source: add.source ?? MediaDetailSourceEnum.CLIX,
              thumbnailUrl: add.thumbnailUrl ?? '',
              mostPopular: add.mostPopular ?? false,
              isSelected: add.isSelected ?? false
            };
            return item;
          });

          let videos: IMediaAdditionalInfo[] = result.videos?.filter(x => x.active).map(vid => {
            const item: IMediaAdditionalInfo = {
              key: vid.key,
              name: vid.name,
              site: vid.site,
              source: vid.source ?? MediaDetailSourceEnum.CLIX,
              displayOrder: transformMediaDisplayOrder(vid.name, vid.source ?? MediaDetailSourceEnum.CLIX, vid.mostPopular, vid.isSelected ?? false),
              active: vid.active,
              thumbnailUrl: vid.thumbnailUrl,
              mostPopular: vid.mostPopular,
              isSelected: vid.isSelected
            };
            return item;
          })
            ?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});
  
        result.videos = videos;
     }

    return result;
  }

  private convertTmpdbToMediaDetailResponse = async (
            mediaItemId: string,
            tmdbDetail: ITmdbMediaShortInfo, 
            credits: ITmdbCreditResponse, 
            watchs: ITmdbWatchProviderResponse | undefined, 
            configuration: IConfiguration,
            mediaType: string): Promise<IMediaShortInfo> => {
  
    let result: IMediaShortInfo = transformITmdbMediaShortInfo(tmdbDetail, mediaType);

    if (result.backdropPath && !isAbsolutePath(result.backdropPath)) {
      result.backdropPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.ORIGINAL}${result.backdropPath}`;
    }
    if (result.posterPath && !isAbsolutePath(result.posterPath)) {
      result.posterPath = `${configuration.images.secure_base_url}${TMDBSizeEnum.ORIGINAL}${result.posterPath}`;
    }

    const tmdbCasts = credits?.cast ?? [];
    result.casts = tmdbCasts.map(tmdbCast => {
      let cast: IMediaCastInfo = {
        adult: tmdbCast.adult ?? true,
        gender: tmdbCast.gender,
        name: tmdbCast.name,
        knownDepartment: tmdbCast.known_for_department,
        profilePath: tmdbCast.profile_path,
      };
      if (cast.profilePath) {
        cast.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${cast.profilePath}`;
      }
      return cast;
    })
    let flatrates = watchs?.flatrate || [];

    let watchProviders = flatrates.map(tmdbWatch => {
      const logoPath = tmdbWatch.logo_path && !isAbsolutePath(tmdbWatch.logo_path)
        ? `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${tmdbWatch.logo_path}`
        : tmdbWatch.logo_path ?? '';

      const watch: IMediaWatchProviderInfo = {
          id: '',
          link: watchs?.link ?? null,
          logoPath: logoPath,
          providerId: tmdbWatch.provider_id,
          providerName: tmdbWatch.provider_name,
          isSelected: false
        };
        return watch;
      });

    const watchDbs = await prisma.mediaWatchProvider.findMany({
      where: { mediaItemId: mediaItemId }
    });

    watchDbs.forEach(watchDb => {      
      let watch = watchProviders.filter(x => x.providerId === watchDb.providerId)[0];
      const logoPath = watchDb.logoPath  && !isAbsolutePath(watchDb.logoPath)
        ? `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${watchDb.logoPath}`
        : watchDb.logoPath ?? '';

      if (watch) {
        watch.id = watchDb.id;
        watch.isSelected = watchDb.isSelected ?? false;
        watch.logoPath = logoPath;
        watch.link = watchDb.link;
      } else {        
        watchProviders.push({
          ...watchDb, isSelected: watchDb.isSelected ?? false, logoPath: logoPath
        });
      }
    });

    result.watchProviders = watchProviders;

    if (result.videos?.length) {
      const whereAdditionalItem: Prisma.MediaAdditionalItemWhereInput = {
        AND: [
          { mediaItemId: mediaItemId },
          { source: MediaDetailSourceEnum.TMDB }
        ]
      };
      const videoDbs = await prisma.mediaAdditionalItem.findMany({ where: whereAdditionalItem });
      result.videos.forEach(video => {
        const videoDb = videoDbs.filter(x => x.key === video.key && x.site === video.site)[0];
        video.active = videoDb?.active ?? false;
        video.source = MediaDetailSourceEnum.TMDB;
        video.isSelected = videoDb?.isSelected ?? false;
      });
    }

    const directors = credits.crew?.filter(x => (x.job?? "").toLowerCase() === TMDBCreditJobEnum.DIRECTOR.toLowerCase());
    let directorConverts =  directors?.map(cast => {
      let item: IMediaCastInfo = {
        adult: cast.adult ?? false,
        gender: cast.gender,
        knownDepartment: cast.known_for_department,
        name: cast.name,
        profilePath: cast.profile_path,
      };
      if (item.profilePath) {
        item.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.profilePath}`;
      }
      return item;
    });

    directorConverts = directorConverts ?? [];

    const createBys = tmdbDetail?.created_by ?? [];;
    createBys.forEach(createBy => {
      let item: IMediaCastInfo = {
        adult: createBy.adult ?? false,
        gender: createBy.gender,
        knownDepartment: createBy.known_for_department,
        name: createBy.name,
        profilePath: createBy.profile_path,
      };
      if (item.profilePath) {
        item.profilePath = `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.profilePath}`;
      }
      directorConverts?.push(item);
    })
    result.directors = directorConverts;

    return result;
  }

  private convertTmpdbToBaseResponse = async (tmdbResults: ITmdpBaseResponse<ITmdbMediaShortInfo>, type: string): Promise<IBaseResponse<IMediaShortInfo>> => {
    const result = transformTmdbBaseResponse(tmdbResults, type);
    if (result.results.length) {
      const configuration = await metaDataService.getConfiguration();
      const genres = await metaDataService.getGenres();
      const tmdbIds = result.results.map(it => it.tmdbId).filter((value, index, self) => self.indexOf(value) === index);
      const mediaDbs = await this.getPrismaMediaByTmdpIds(tmdbIds, type);

      result.results.forEach(item => {
        item.backdropPath = item.backdropPath ? `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.backdropPath}` : "";
        item.posterPath = item.posterPath ? `${configuration.images.secure_base_url}${TMDBSizeEnum.W300}${item.posterPath}` : "";

        ///Fill Id - for status: IMPORTED
        const mediaDb = mediaDbs.filter(m => m.tmdbId === item.tmdbId)[0];
        item.id = mediaDb?.id;
        item.active = mediaDb?.active ?? true;

        //Fill Genre
        const tmdbItem = tmdbResults.results.filter(x => x.id == item.tmdbId)[0];
        if (tmdbItem != null && tmdbItem.genre_ids?.length) {
          item.genres = tmdbItem.genre_ids.map(genreId => {
            const itemGenre = genres.filter(g => g.id === genreId)[0];
            return itemGenre?.name;
          })
        }
      })
    }
    return result;
  }


  private getPrismaMediaByTmdpIds =async (tmdbIds: number[], mediaType: string): Promise<MediaItem[]> => {
    if (!tmdbIds?.length) {
      return [];
    }
    const whereCondition: Prisma.MediaItemWhereInput = {
      AND: [
        {
          tmdbId: {
            in: tmdbIds
          }
        },
        {
          mediaType: mediaType
        }
      ]
  };
    
    const result = await prisma.mediaItem.findMany({ where: whereCondition });
    return result;
  }

  public voteAverageDisplay = (voteAverage: number|null|undefined): string => {
    return !voteAverage ? "": `${(voteAverage * 10).toFixed()}%`;
  }

  

  public getUserStatusByToken = async (token: string, mediaItemIds: string[]): Promise<IUserMediaInfoStatus[]> => {
    return await this.getV2UserMediaStatuses(token, mediaItemIds);
  }

  public getUserMediaGameStatus = async (mediaItemIds: string[], userGenreRoundGameId: string): Promise<any[]> => {
    const userGenreMediaRoundGames = await prisma.userGenreMediaRoundGame.findMany({
      where: {
        AND: [
          { userGenreRoundGameId: userGenreRoundGameId },
          {
            mediaItemId: {
              in: mediaItemIds
            }
          }
        ]
      }
    });

    const results: any[] = userGenreMediaRoundGames.map(genreMediaGame => {
      const item: any = {
        mediaItemId: genreMediaGame.mediaItemId,
        isCompleteGame: genreMediaGame.status === UserGameStatus.COMPLETE
      };
      return item;
    })

    return results;
  }

  public getUserMediaStatus = async (userId: string, mediaItemIds: string[]): Promise<IUserMediaInfoStatus[]> => {
    const whereWatchList: Prisma.UserMediaWatchListWhereInput = {
      AND: [
        {
          userId: userId
        },
        {
          mediaItemId: {
            in: mediaItemIds
          }
        },
      ]
    };
    
    const userMediaWatchLists = await prisma.userMediaWatchList.findMany({where: whereWatchList});

    const rates = await Promise.all(mediaItemIds
      .map(mediaItemId => userMediaService.getUserMediaAnswerByUserId(userId, mediaItemId)));

    const results: IUserMediaInfoStatus[] = mediaItemIds.map(mediaItemId => {
      const rateData = rates.filter(x => x?.mediaItemId === mediaItemId)[0];
      const item: IUserMediaInfoStatus = {
        mediaItemId: mediaItemId,
        isExistWatchList: userMediaWatchLists.some(x => x.mediaItemId === mediaItemId),
        rate: rateData
      };
      return item;
    })

    return results;
  }

  public getV2UserMediaStatuses = async (token: string, mediaItemIds: string[]): Promise<IUserMediaInfoStatus[]> => {
    const provider = await accountService.getUserProviderByToken(token);
    if (!provider?.userId) {
      return [];
    }
    const userId = provider.userId;

    const queryStatuses = `
    SELECT tt.mediaItemId,
      CASE
        WHEN ISNULL(ums.rateScore) = 1 THEN CAST('0' AS CHAR )
        ELSE CAST('1' AS CHAR )
      END AS isRateMedia,
        CASE
        WHEN ISNULL(ums.selectScore) = 1 THEN '0'
        ELSE '1'
      END AS isSelectQuestionare,
        CASE
        WHEN ISNULL(ums.viewAdsScore) = 1 THEN '0'
        ELSE '1'
      END AS isWatchAds,
        CASE
        WHEN ISNULL(ums.viewGameScore) = 1 THEN '0'
        ELSE '1'
      END AS isWatchGame,
      CASE
        WHEN ISNULL(umwl.id) = 1 THEN '0'
        ELSE '1'
      END AS isExistWatchList,
      umq.questionaireId AS questionaireSeletedId
    FROM JSON_TABLE(CONCAT('${JSON.stringify(mediaItemIds)}'), "$[*]"
            COLUMNS(
              mediaItemId VARCHAR(191) COLLATE utf8mb4_unicode_ci PATH "$"
              )
          ) AS tt
    LEFT JOIN LATERAL (
        SELECT *
        FROM UserMediaStat ums
        WHERE ums.userId = '${userId}' AND ums.mediaItemId = tt.mediaItemId
        LIMIT 1
        ) ums ON 1=1 
    LEFT JOIN LATERAL (
        SELECT umq.questionaireId
        FROM UserMediaQuestionaire umq
        WHERE umq.userId = '${userId}' AND umq.mediaItemId = tt.mediaItemId
        LIMIT 1
        ) umq ON 1=1 
    LEFT JOIN LATERAL (
        SELECT umwl.id
        FROM UserMediaWatchList umwl
        WHERE umwl.userId = '${userId}' AND umwl.mediaItemId = tt.mediaItemId
        LIMIT 1
        ) umwl ON 1=1
    `;

    const queryAnswers = `
      SELECT umq.mediaItemId,
        umq.questionaireId,
        uma.questionOptionId,
          uma.point
      FROM JSON_TABLE(CONCAT('${JSON.stringify(mediaItemIds)}'), "$[*]"
              COLUMNS(
                mediaItemId VARCHAR(191) COLLATE utf8mb4_unicode_ci PATH "$"
                )
            ) AS tt
      JOIN UserMediaQuestionaire umq ON umq.mediaItemId = tt.mediaItemId
      JOIN UserMediaAnswer uma ON uma.userMediaQuestionaireId = umq.id
      WHERE umq.userId = '${userId}';
    `;

    const includeQuestionaire: Prisma.QuestionaireInclude = {
      questions: {
        include: {
          questionOptions: true
        }
      },
    };

    const whereQuestionaire = { 
      active: true
    };
    
    const [items, allQuestionaires, allQuestionAnswers] = await Promise.all([
      prisma.$queryRaw<any[]>(Prisma.raw(queryStatuses)),
      prisma.questionaire.findMany({
        where: whereQuestionaire,
        include: includeQuestionaire
      }),
      prisma.$queryRaw<any[]>(Prisma.raw(queryAnswers)),
    ]);

    if (!items.length) {
      return [];
    }

    
    const results:IUserMediaInfoStatus[] = mediaItemIds.map(mediaItemId => {
      const itemStatus = items.filter((x: any) => x.mediaItemId === mediaItemId)[0];
      const questionAnswers = allQuestionAnswers.filter(x => x.mediaItemId === mediaItemId) ?? [];

      let questionaireSelected: IQuestionaireInfo|undefined = undefined;
      const questionaireId = questionAnswers[0]?.questionaireId ?? itemStatus?.questionaireSeletedId;
      if (questionaireId) {
        const questionaire = allQuestionaires.filter(x => x.id === questionaireId)[0];  
        if (questionaire) {
          questionaireSelected = {
            id: questionaire.id,
            isLiked: questionaire.isLiked,
            isWatched: questionaire.isWatched,
            questions: (questionaire.questions ?? []).map((q: any) => {
              const options = (q.questionOptions ?? [])
              .sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});

              const question: IQuestionInfo = {
                description: q.description,
                id: q.id,
                title: q.title,
                type: q.type,
                options: options.map((o: any) => {
                  const answer = questionAnswers.filter(x => x.questionOptionId === o.id)[0];
                  const item: IQuestionOption = {
                    description: o.description,
                    id: o.id,
                    title: o.title,
                    type: o.type,
                    isSelected: !!answer,
                    point: answer?.point ?? 1
                  };
                  return item;
                })
              };
              return question;
            })
          };
        }  
      }
      const item: IUserMediaInfoStatus = {
        isExistWatchList: itemStatus?.isExistWatchList === '1',
        mediaItemId: mediaItemId,
        rate: {
          isRateMedia: itemStatus?.isRateMedia === '1',
          isSelectQuestionare: itemStatus?.isSelectQuestionare === '1',
          isWatchAds: itemStatus?.isWatchAds === '1',
          isWatchGame: itemStatus?.isWatchGame === '1',
          mediaItemId: mediaItemId,
          questionaireSeleted: questionaireSelected
        }
      };

      return item;
    })
    
    return results;
  }


  private sortGenres = (genres: string, selectedGenre?: string): string => {
    if (!selectedGenre) {
      return genres;
    }
    let genreArrs: string[] = JSON.parse(genres ?? '[]');
    if (!genreArrs?.length) {
      return genres;
    }
    const arrs = genreArrs.map(x => {
      let item = {
        genre: x,
        displayOrder: x===selectedGenre ? 1: 10
      };
      return item;
    })?.sort(function(a: any, b: any) {return a.displayOrder - b.displayOrder});

    genreArrs = arrs.map(x => x.genre);
    
    const results = JSON.stringify(genreArrs);
    return results;
  }

  private searchCommonMediaItems = async (keyword: string, offset: number, pageSize: number, isSearchAdvance: boolean, genre: string, searchType: ClixSearchType, excepMediaItemIds?: string[]): Promise<MediaItem[]> => {
    offset = offset <= 0 ? 0: offset;
    excepMediaItemIds = excepMediaItemIds ?? [];
    const mediaTypes = searchType === ClixSearchType.ALL
      ? `('${TMDBMediaTypeEnum.MOVIE}', '${TMDBMediaTypeEnum.TV}', '${TMDBMediaTypeEnum.PROMOS}', '${TMDBMediaTypeEnum.ADS}')`
      : searchType === ClixSearchType.TITLE
        ? `('${TMDBMediaTypeEnum.MOVIE}', '${TMDBMediaTypeEnum.TV}')`
        : `('${TMDBMediaTypeEnum.PROMOS}', '${TMDBMediaTypeEnum.ADS}')`;

    const isSearchAdvanceToInt = isSearchAdvance ? 1 : 0;

    const genreConvert = genre && genre !== '' ? `%"${genre}"%`: '';
    const orginalKeyword = keyword ?? '';
    keyword = `%${keyword ?? ""}%`;

    const query = `
    
    SELECT m.*
    FROM MediaItem m
    WHERE (
      '${genreConvert}' = ''
      OR genres LIKE '${genreConvert}'
      )
    AND mediaType IN ${mediaTypes}
    AND (
      name LIKE '${keyword}'
      OR tags LIKE '${keyword}'
      OR genres LIKE '${keyword}'
      OR overview LIKE '${keyword}'
      OR voteAveragePercent LIKE '${keyword}'
      OR YEAR(releaseDate) LIKE '${keyword}'
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaAdditionalItem ma
          WHERE ma.mediaItemId = m.id
            AND ma.name LIKE '${keyword}' LIMIT 1
          )
        )
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaCreditItem mc
          WHERE mc.mediaItemId = m.id
            AND mc.name LIKE '${keyword}' LIMIT 1
          )
        )
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaWatchProvider mw
          WHERE mw.mediaItemId = m.id
            AND mw.providerName LIKE '${keyword}' LIMIT 1
          )
        )
      )
    ORDER BY CASE 
        WHEN name = '${orginalKeyword}'
          THEN 0
        WHEN name LIKE '${keyword}'
          THEN 1
        WHEN YEAR(releaseDate) LIKE '${keyword}'
          THEN 2
        WHEN overview LIKE '${keyword}'
          THEN 3		
        ELSE 4
        END ASC 
    LIMIT ${offset},${pageSize};
    `;
    const mediaItems = await prisma.$queryRaw<MediaItem[]>(Prisma.raw(query));

    return mediaItems ?? [];
  };

  private countCommonMediaItems = async (keyword: string, isSearchAdvance: boolean, genre: string, searchType: ClixSearchType, excepMediaItemIds?: string[]): Promise<bigint> => {
    excepMediaItemIds = excepMediaItemIds ?? [];
    keyword = `%${keyword ?? ""}%`;
    const isSearchAdvanceToInt = isSearchAdvance ? 1 : 0;
    const genreConvert = genre && genre !== '' ? `%"${genre}"%`: '';
    const mediaTypes = searchType === ClixSearchType.PROMO_ADS
      ? `('${TMDBMediaTypeEnum.PROMOS}', '${TMDBMediaTypeEnum.ADS}')`
      : `('${TMDBMediaTypeEnum.MOVIE}', '${TMDBMediaTypeEnum.TV}')`;
    const query = `
    SELECT count(1) AS total
    FROM MediaItem m
    WHERE (
      '${genreConvert}' = ''
      OR genres LIKE '${genreConvert}'
      )
    AND mediaType IN ${mediaTypes}
    AND (
      name LIKE '${keyword}'
      OR tags LIKE '${keyword}'
      OR genres LIKE '${keyword}'
      OR overview LIKE '${keyword}'
      OR voteAveragePercent LIKE '${keyword}'
      OR YEAR(releaseDate) LIKE '${keyword}'
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaAdditionalItem ma
          WHERE ma.mediaItemId = m.id
            AND ma.name LIKE '${keyword}' LIMIT 1
          )
        )
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaCreditItem mc
          WHERE mc.mediaItemId = m.id
            AND mc.name LIKE '${keyword}' LIMIT 1
          )
        )
      OR (
        ${isSearchAdvanceToInt} = 1
        AND EXISTS (
          SELECT 1
          FROM MediaWatchProvider mw
          WHERE mw.mediaItemId = m.id
            AND mw.providerName LIKE '${keyword}' LIMIT 1
          )
        )
      )  ;
    `;
    const items = await prisma.$queryRaw<any[]>(Prisma.raw(query));
    const result = items?.length ? items[0].total : 0;

    return result;
  };
}

export const syncRecommendations = async (mediaItemIds: string[]) => {
  emitter.emit(CMSEventEnum.SYNC_RECOMMENDATIONS, mediaItemIds);
};

const mediaService = new MediaService();

export default mediaService;
