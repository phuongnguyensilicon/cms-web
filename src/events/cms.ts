import { mediaService } from "@services/index";

export const onSyncRecommendations = async (mediaItemIds: string[]) => {
  await mediaService.updateRecommendations(mediaItemIds);
};