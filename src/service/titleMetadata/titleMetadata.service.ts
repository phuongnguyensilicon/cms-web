import { TitleMetadata, Prisma } from "@prisma/client";
import prisma from "@/utils/prisma.util";
import {
  IAddTitleMetadataPayload,
  ITitleMetadataTransform
} from "./titleMetadata.type";
import { ERROR_CODE } from "@/utils/constant.util";

class TitleMetadataService {
  private _defaultCondition: Prisma.TitleMetadataWhereInput = { active: true };
  public transformData = (
    metadata: TitleMetadata[]
  ): ITitleMetadataTransform => {
    const titleMetadata: ITitleMetadataTransform = {};
    for (const data of metadata) {
      titleMetadata[data.metaKey] = data.metaValue;
    }
    return titleMetadata;
  };
  public addToDB = async (
    data: IAddTitleMetadataPayload
  ): Promise<TitleMetadata> => {
    try {
      const titleMetadata = await prisma.titleMetadata.create({
        data
      });
      return titleMetadata;
    } catch (err: unknown) {
      console.error(err);
      throw new Error(ERROR_CODE.CANNOT_CREATE_TITLE_METADATA);
    }
  };

  public getByTitleId = async (
    titleId: string
  ): Promise<ITitleMetadataTransform> => {
    const metadata = await prisma.titleMetadata.findMany({
      where: {
        ...this._defaultCondition,
        titleId
      }
    });

    return this.transformData(metadata);
  };
}

const titleMetadataService = new TitleMetadataService();

export default titleMetadataService;
