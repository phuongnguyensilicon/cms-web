import { EventEmitter } from "node:events";
import { EVENTS } from "@/utils/enum";
import { IUpdateUserParams } from "@/model/account/userInfo";
import { accountService } from "@services/index";
import { CMSEventEnum } from "@/utils/enum";
import { onSyncRecommendations } from "./cms";
const emitter = new EventEmitter();

const onSyncAuth0 = async (token: string) => {
  accountService.syncUpdateUser(token);
};

const onSyncProfile = async ({ payload, token }: any) => {
  accountService.updateUser(payload, token);
};

emitter.on(EVENTS.SYNC_START_AUTH0, (payload: any) => {
  console.info(JSON.stringify(payload));
});

emitter.on(EVENTS.SYNC_VERIFY_AUTH0, (payload: any) => {
  console.info(JSON.stringify(payload));
});

emitter.on(EVENTS.SYNC_AUTH0, onSyncAuth0);
emitter.on(EVENTS.SYNC_PROFILE, onSyncProfile);

emitter.on(CMSEventEnum.SYNC_RECOMMENDATIONS, onSyncRecommendations);
export default emitter;
