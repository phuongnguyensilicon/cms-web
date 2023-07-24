import {NextRequest, NextResponse} from 'next/server'
import { parseJwtTokenAuth0 } from './utils/jwt.utils';
import { handleResponse } from './utils/common.util';
import { HeaderKeyEnum, StatusCodeEnum } from './utils/enum';

// export const config = {
//   matcher: ['/api/clix/account/:path*']
// };


//https://community.auth0.com/t/how-to-validate-a-token-on-next-js-backend-from-a-separate-frontend/103328/2
//https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
export async function middleware(req: NextRequest) {
  const authenPaths = [
    '/api/clix/account',
    '/api/file/avatar',
  ];

  let response = NextResponse.next();
  response.headers.append("Access-Control-Allow-Origin", "*");

  if (req.method === 'OPTIONS') {
    return NextResponse.json({});
  }

  if (authenPaths.some(x => req.url.includes(x))) {
    const token = req.headers.get(HeaderKeyEnum.AUTHORIZATION);
    if (token) {
      const result = await parseJwtTokenAuth0(token);
      if (result && result.payload) {
        return response;
      }
    } 
    
    return handleResponse(null, StatusCodeEnum.UNAUTHORIZED);
  }
  return response;
  
}
