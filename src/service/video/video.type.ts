import { Video } from "@prisma/client";

export interface IAddVideoPayload {
  titleId: string;
  name: string;
  value: string;
}

export type IUpdateTitleVideoPayload = Partial<
  Omit<Video, "id" | "titleId" | "createdAt" | "updatedAt" | "active">
>;
