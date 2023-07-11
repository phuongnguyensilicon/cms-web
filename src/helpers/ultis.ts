import dayjs from 'dayjs';

export function formatOTPInput(str: string) {
  return str
    .replace(/[^0-9]/g, '')
    .split('')
    .join('-');
}

export function formatPhoneInput(str: string) {
  return str
    .replace(/[^0-9]/g, '')
    .replace(/(\d{1,3})(\d{1,3})?(\d{1,4})?/, '$1-$2-$3')
    .slice(0, 12)
    .replace(/-+$/, '');
}

export function formatDateInput(str: string) {
  const result = str
    .replace(/[^0-9]/g, '')
    .replace(/(\d{1,2})(\d{1,2})?(\d{1,4})?/, '$1/$2/$3')
    .slice(0, 12)
    .replace('//', '');

  return result.endsWith('/') ? result.slice(0, -1) : result;
}

export function formatUsernameInput(str: string) {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 20)
    .toLocaleLowerCase();
}

export function OTPOutput(str: string) {
  return str.replace(/[^0-9]/g, '');
}

export function PhoneUS(str: string) {
  return '+1' + OTPOutput(str);
}

export function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, match => match.toUpperCase());
}

export function dateUTC(input: unknown): string {
  if (input) {
    const dateString = ('' + input).replace(/[^0-9]/g, '');
    const year = parseInt(dateString.slice(0, 4));
    const month = parseInt(dateString.slice(4, 6));
    const day = parseInt(dateString.slice(6, 8));
    const dob = new Date(year, month - 1, day);
    return dayjs(dob).format('MM/DD/YYYY');
  } else {
    return '';
  }
}

export function breakDate(input: string | undefined): any {
  if (!input) {
    return { day: 0, month: '', year: 0 };
  }

  const day = new Date(input).getUTCDate();
  const month = dayjs(input).format('MMM');
  const year = dayjs(input).year();
  return { day, month, year };
}
