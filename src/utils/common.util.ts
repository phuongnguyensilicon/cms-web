import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { DATE_FORMAT } from "./constant.util";
import { StatusCodeEnum } from "./enum";

const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

export const formatDate = (date: string, format = DATE_FORMAT) => {
  return dayjs(date, format).format("MMMM, D YYYY");
};

export const throwResponseError = (
  message: string,
  status = StatusCodeEnum.BAD_REQUEST
): NextResponse => {
  return NextResponse.json(
    {
      message,
      statusCode: status
    },
    {
      status
    }
  );
};

export const handleResponse = <T>(
  message?: T,
  status = StatusCodeEnum.OK
): NextResponse => {
  return NextResponse.json(
    {
      data: message,
      statusCode: status
    },
    {
      status,
      headers: {
        'cache-control': 'no-store',
        'X-Vercel-Cache': 'MISS',
      },
    }
  );
};

export function isAbsolutePath(path: string): boolean {
  if (path.indexOf('://') > 0 || path.indexOf('//') === 0 ) {
    return true;
  }
  return false;
}

export function randomString(): string {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}

export function randomTixCode(): string {
  let r = (Math.random() + 1).toString(36).substring(3);
  return r.toUpperCase();
}


export function generateUserName(name: string): string {
  const r = randomString();
  const result = `${name} - ${r}`;
  return result;
}

export function convertToTmdbScore(voteAverage: number|null|undefined): number|undefined {
  if (!voteAverage || voteAverage < 0) {
    return undefined;
  }
  const result = Number((voteAverage/2).toFixed(1));
  return result;
}

export const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');