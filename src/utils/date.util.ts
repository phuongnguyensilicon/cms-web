import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { DATE_FORMAT } from "./constant.util";
import { StatusCodeEnum } from "./enum";

const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

export const parseYearToRangeDate = (yearStr: string) => {
  const isValidYear = /^(19|[2-9][0-9])\d{2}$/g.test(yearStr);
  if (!isValidYear) return undefined;
  const year = Number(yearStr);
  const result = {
    minDate: new Date(year, 0,1, 0, 0, 0),
    maxDate: new Date(year, 11, 31, 23, 29, 59)
  };
  return result;
};

export const convertToShortDate = (date: Date): Date => {
  const dateStr = new Date(date).toISOString().substring(0, 10);
  const result = dateStr as unknown as Date;
  return result;
};

export const startOfDay = (today?: Date): Date => {
  if (!today) {
    today = new Date();
  }
  const result = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return result;
};

export const endOfDay = (today?: Date): Date => {
  if (!today) {
    today = new Date();
  }
  const result = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999);
  return result;
};

export const formatOfDate = (format: string, today: Date|undefined|null): string => {
  if (!today) {
    return '';
  }
  const result = dayjs(today).format(format);
  return result;
};


