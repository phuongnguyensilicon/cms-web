import cronService from '@services/cron/cron-service'
import { mediaTmdbSyncService } from '@services/index';
import { NextRequest, NextResponse } from 'next/server'

const syncTmdbListName =  async function GET(req: NextRequest) {
  try {
    await mediaTmdbSyncService.syncTitleInLists();
    return new NextResponse(null, {
      status: 200,
    })
  } catch(ex) {
    console.log(ex);
    return new NextResponse(null, {
      status: 400,
    })
  }
}

export { syncTmdbListName as GET , syncTmdbListName as POST };