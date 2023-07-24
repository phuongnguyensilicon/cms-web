import * as jose from 'jose';


export const parseJwtTokenAuth0 = async (token: string): Promise<any> => {  
  try {
      const jwks = jose.createRemoteJWKSet(new URL(process.env.AUTH0_JWKS_URI!));
      const result = await jose.jwtVerify(token.replace('Bearer ', ''), jwks);
      return result;
  } catch (e) {
      return { payload: null };
  }
};

