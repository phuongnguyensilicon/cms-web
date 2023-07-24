import emitter from "@events/index";
import { getEnv } from "@configs/env";
import { OTPOutput } from "@helpers/ultis";
import { EVENTS } from "@/utils/enum";

const AUTH0_DOMAIN = getEnv("AUTH0_DOMAIN");
const AUTH0_CLIENT_ID = getEnv("AUTH0_CLIENT_ID");
const AUTH0_CALLBACK_URL = getEnv("AUTH0_CALLBACK_URL");
const AUTH0_CLIENT_SECRET = getEnv("AUTH0_CLIENT_SECRET");

export const auth0Start = async (email: string, sms: string, state: string) => {
  const startPasswordlessEndpoint = `https://${AUTH0_DOMAIN}/passwordless/start`;

  const data = {
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    connection: !sms ? "email" : "sms", //email or sms
    send: "code",
    authParams: {
      scope: "openid",
      state
    }
  };

  // type send OTP to SMS or Email
  const body = !sms
    ? { ...data, email }
    : { ...data, phone_number: "+1" + sms.replace(/[^0-9]/g, "") };
  const res: Response = await fetch(startPasswordlessEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...body })
  });

  return responseJson(res, EVENTS.SYNC_START_AUTH0);
};

export const auth0Token = async (code: string) => {
  const tokenEndpoint = `https://${AUTH0_DOMAIN}/oauth/token`;

  const data = {
    grant_type: "authorization_code",
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    code,
    redirect_uri: AUTH0_CALLBACK_URL
  };

  const res: Response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return responseJson(res, EVENTS.SYNC_AUTH0);
};

export const auth0Verify = async (code: string, email = "", sms = "") => {
  const tokenEndpoint = `https://${AUTH0_DOMAIN}/oauth/token`;
  const data = {
    grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    otp: OTPOutput(code),
    realm: !sms ? "email" : "sms", //email or sms
    username: !sms ? email : "+1" + sms.replace(/[^0-9]/g, ""),
    scope: "openid"
  };

  const res: Response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return responseJson(res, EVENTS.SYNC_VERIFY_AUTH0 );
};

export const auth0SigninUrl = (connection = "", state = "", callBackUrl = '') => {
  const redirectUrl = [
    `https://${AUTH0_DOMAIN}/authorize?response_type=code`,
    `&client_id=${AUTH0_CLIENT_ID}`,
    `&redirect_uri=${AUTH0_CALLBACK_URL}`,
    `&scope=openid%20profile%20email`,
    !!state ? `&state=` : "",
    connection && ["google-oauth2", "facebook"].includes(connection)
      ? `&connection=${connection}`
      : ""
  ].join("");
  return redirectUrl;
};

const responseJson = async (res: Response, event: string) => {
  const json = await res.json();
  emitter.emit(event, json);
  return json;
};
