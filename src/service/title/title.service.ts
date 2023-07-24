import { Title, Prisma } from "@prisma/client";
import prisma from "@/utils/prisma.util";
import {
  IAddTitlePayload,
  IGetTitlePayload,
  IGetTitleResponse,
  IUpdateTitlePayload,
  TitleWithMetadata,
  TitleWithProvider
} from "./title.type";
import providerService from "../provider/provider.service";
import { ERROR_CODE } from "@/utils/constant.util";
import titleMetadataService from "../titleMetadata/titleMetadata.service";

class TitleService {
  private _defaultCondition: Prisma.TitleMetadataWhereInput = { active: true };
  private _titleTagArgs: Prisma.Title$tagsArgs = {
    where: {
      active: true
    }
  };

  private _createTagInputForQuery = (
    tagIds: string[] | undefined
  ): Prisma.TagUncheckedUpdateManyWithoutTitlesNestedInput | undefined => {
    if (!Array.isArray(tagIds)) return undefined;
    let updatedTags: Prisma.TagUncheckedUpdateManyWithoutTitlesNestedInput = {};
    if (tagIds.length > 0) {
      updatedTags = { set: [], connect: tagIds.map(tagId => ({ id: tagId })) };
    } else {
      updatedTags = {
        set: []
      };
    }

    return updatedTags;
  };
  public addToDB = async ({
    tags = [],
    ...data
  }: IAddTitlePayload): Promise<Title> => {
    try {
      const { mediaType, metadata, ...payload } = data;
      const provider = await providerService.getByName(mediaType);
      const title = await prisma.title.create({
        data: {
          ...payload,
          synopsis: "",
          providerId: provider.id,
          tags: {
            connect: tags.map(tagId => ({ id: tagId }))
          }
        }
      });
      for (const key in metadata) {
        if (key !== "id") {
          const metaValue = (metadata as any)[key];
          metaValue &&
            (await titleMetadataService.addToDB({
              metaKey: key,
              metaValue: metaValue.toString(),
              titleId: title.id
            }));
        }
      }
      return title;
    } catch (err: unknown) {
      console.error(err);
      throw new Error(ERROR_CODE.CANNOT_CREATE_TITLE);
    }
  };

  public getByCondition = async (
    condition: Prisma.TitleWhereInput
  ): Promise<Title> => {
    const title = await prisma.title.findFirst({
      where: condition,
      include: {
        provider: true,
        tags: this._titleTagArgs
      }
    });
    if (!title) {
      throw new Error(ERROR_CODE.TITLE_NOT_FOUND);
    }
    return title;
  };

  public getsByCondition = async ({
    limit = 10,
    offset = 0,
    query = "",
    tmdbIds,
    includeMetadata = false
  }: IGetTitlePayload): Promise<IGetTitleResponse> => {
    const whereCondition: Prisma.TitleWhereInput = {
      ...this._defaultCondition
    };
    const args: Prisma.TitleFindManyArgs = {
      orderBy: {
        createdAt: "desc"
      },
      include: {
        tags: this._titleTagArgs
      }
    };
    if (offset !== -1) {
      args.skip = offset;
    }
    if (limit !== -1) {
      args.take = limit;
    }
    if (includeMetadata) {
      args.include = {
        ...args.include,
        metadata: true
      };
    }
    if (query) {
      whereCondition.name = {
        search: query
      };
    }
    if (tmdbIds) {
      whereCondition.tmdbId = {
        in: tmdbIds
      };
    }
    const transactions = await prisma.$transaction([
      prisma.title.count({
        where: whereCondition
      }),
      prisma.title.findMany({ ...args, where: whereCondition })
    ]);

    return {
      results: transactions[1].map(title => ({
        ...title,
        metadata: titleMetadataService.transformData(
          (title as TitleWithMetadata).metadata
        )
      })),
      totalResults: transactions[0]
    };
  };

  public getById = async (titleId: string): Promise<TitleWithProvider> => {
    const title = await prisma.title.findFirst({
      where: {
        ...this._defaultCondition,
        id: titleId
      },
      include: {
        provider: true,
        tags: this._titleTagArgs
      }
    });
    if (!title) {
      throw new Error(ERROR_CODE.TITLE_NOT_FOUND);
    }
    return title;
  };

  public getsByTmdbIds = async (
    tmdbIds: number[]
  ): Promise<TitleWithProvider[]> => {
    const whereCondition: Prisma.TitleWhereInput = {
      ...this._defaultCondition,
      tmdbId: {
        in: tmdbIds
      }
    };
    const titles = await prisma.title.findMany({
      where: whereCondition,
      include: { provider: true }
    });

    return titles;
  };

  public updateById = async (
    titleId: string,
    { tags, ...payload }: IUpdateTitlePayload
  ): Promise<Title> => {
    await this.getById(titleId);
    const updated = await prisma.title.update({
      where: { id: titleId },
      data: {
        ...payload,
        tags: this._createTagInputForQuery(tags)
      }
    });
    return updated;
  };

  public removeById = async (titleId: string): Promise<Title> => {
    await this.getByCondition({ ...this._defaultCondition, id: titleId });
    const deleted = await prisma.title.update({
      where: { id: titleId },
      data: { active: false }
    });
    return deleted;
  };
}

const titleService = new TitleService();

export default titleService;
