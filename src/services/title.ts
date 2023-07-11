import { HttpClient } from './http-client';

export const TitleService = {
  getTitleById: (id: string) => {
    return HttpClient.get<any>('clix/media/detail', {
      id
    });
  },
  addOrRemoveToWatchList: (params: any) => {
    return HttpClient.post<any>('clix/account/media/watchList', params);
  },
  updateQuestionaire: (payload: any) => {
    return HttpClient.post('clix/account/media/questionaire', payload);
  },
  viewVideo: (payload: any) => {
    return HttpClient.post('clix/account/media/view-game', payload);
  },
  viewTrailer: (payload: any) => {
    return HttpClient.post('clix/account/media/ads', payload);
  },
  submitRatingTitle: (payload: any) => {
    return HttpClient.put('clix/account/game/submit-media', payload);
  }
};
