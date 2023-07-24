import cronService from '@services/cron/cron-service'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  try {
    await cronService.removeTitleDuplicate();
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