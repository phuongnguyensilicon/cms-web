import { Video, Prisma } from "@prisma/client";
import prisma from "@/utils/prisma.util";
import { IAddVideoPayload, IUpdateTitleVideoPayload } from "./video.type";
import titleService from "../title/title.service";
import { ERROR_CODE } from "@/utils/constant.util";

class VideoService {
  private _defaultCondition: Prisma.VideoWhereInput = { active: true };
  public getByCondition = async (
    condition: Prisma.VideoWhereInput
  ): Promise<Video> => {
    const video = await prisma.video.findFirst({
      where: { ...this._defaultCondition, ...condition }
    });
    if (!video) {
      throw new Error(ERROR_CODE.VIDEO_NOT_FOUND);
    }
    return video;
  };

  public getsByCondition = async (
    condition: Prisma.VideoWhereInput
  ): Promise<Video[]> => {
    const videos = await prisma.video.findMany({
      where: { ...this._defaultCondition, ...condition }
    });
    return videos;
  };

  public addToDb = async (payload: IAddVideoPayload): Promise<Video> => {
    const video = await prisma.video.create({
      data: payload
    });
    return video;
  };

  public addsToDb = async (videos: IAddVideoPayload[]): Promise<number> => {
    const rows = await prisma.video.createMany({
      data: videos
    });
    return rows.count;
  };

  public getsByTitleId = async (titleId: string): Promise<Video[]> => {
    await titleService.getById(titleId);
    return this.getsByCondition({ titleId, active: true });
  };

  public getById = async (videoId: string): Promise<Video> => {
    const video = await prisma.video.findFirst({
      where: {
        ...this._defaultCondition,
        id: videoId
      }
    });
    if (!video) {
      throw new Error(ERROR_CODE.VIDEO_NOT_FOUND);
    }
    return video;
  };

  public updateById = async (
    videoId: string,
    payload: IUpdateTitleVideoPayload
  ): Promise<Video> => {
    await this.getById(videoId);
    const updated = await prisma.video.update({
      where: { id: videoId },
      data: payload
    });
    return updated;
  };

  public removeById = async (videoId: string): Promise<void> => {
    await this.getById(videoId);
    await prisma.video.update({
      where: { id: videoId },
      data: {
        active: false
      }
    });
  };
}

const videoService = new VideoService();

export default videoService;
