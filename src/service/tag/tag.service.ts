import { Prisma, Tag } from "@prisma/client";
import prisma from "@/utils/prisma.util";
import { IAddTagPayload } from "./tag.type";
import { ERROR_CODE } from "@/utils/constant.util";

class TagService {
  private _defaultCondition: Prisma.TagWhereInput = { active: true };
  public getByCondition = async (
    condition: Prisma.TagWhereInput
  ): Promise<Tag> => {
    const tag = await prisma.tag.findFirst({ where: condition });
    if (!tag) {
      throw new Error(ERROR_CODE.TAG_NOT_FOUND);
    }
    return tag;
  };

  public addToDb = async (payload: IAddTagPayload): Promise<Tag> => {
    try {
      const tag = await prisma.tag.findFirst({ where: { name: payload.name } });
      if (tag) {
        throw new Error(ERROR_CODE.CANNOT_CREATE_TAG);
      }
      const created = await prisma.tag.create({ data: payload });
      return created;
    } catch (err) {
      console.error(err);
      throw new Error(ERROR_CODE.CANNOT_CREATE_TAG);
    }
  };

  public getAll = async (): Promise<Tag[]> => {
    const tags = await prisma.tag.findMany({ where: this._defaultCondition });
    return tags;
  };

  public getById = async (tagId: string): Promise<Tag> => {
    const tag = await prisma.tag.findFirst({
      where: { ...this._defaultCondition, id: tagId }
    });

    if (!tag) {
      throw new Error(ERROR_CODE.TAG_NOT_FOUND);
    }
    return tag;
  };

  public updateById = async (
    tagId: string,
    payload: IAddTagPayload
  ): Promise<Tag> => {
    await this.getById(tagId);
    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: payload
    });
    return updated;
  };

  public removeById = async (tagId: string): Promise<Tag> => {
    await this.getById(tagId);
    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: { active: false }
    });
    return updated;
  };
}

const tagService = new TagService();

export default tagService;
