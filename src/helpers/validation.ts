import { ERROR_DATE } from '@constants/common';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidOTP(code: string): boolean {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(code.replace(/[^0-9]/g, ''));
}

export function isValidPhoneNumber(code: string): boolean {
  const otpRegex = /^\d{10}$/;
  return otpRegex.test(code.replace(/[^0-9]/g, ''));
}

export function isValidUsername(username: string): boolean {
  const regex = /^[a-zA-Z][a-zA-Z0-9-_]{2,19}$/;
  return regex.test(username);
}

export function isInvalidDateOfBirth(dateStr: string): string | null {
  const today = new Date();
  const dateString = dateStr.replace(/[^0-9]/g, '');

  if (dateString.length !== 8) {
    return ERROR_DATE.INVALID;
  }

  const month = parseInt(dateString.slice(0, 2));
  const day = parseInt(dateString.slice(2, 4));
  const year = parseInt(dateString.slice(4));
  const date = new Date(year, month - 1, day);

  if (
    date.getMonth() + 1 !== month ||
    date.getDate() !== day ||
    date.getFullYear() !== year
  ) {
    return ERROR_DATE.INVALID;
  }
  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - 100);

  // Allow from 0..100 year's old
  return date > today
    ? ERROR_DATE.FEATURE_DATE_AGE
    : date < minAgeDate
    ? ERROR_DATE.OVER_100_AGE
    : null;
}
