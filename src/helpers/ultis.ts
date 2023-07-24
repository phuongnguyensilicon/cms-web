export function formatOTPInput(str: string) {
  return str
    .replace(/[^0-9]/g, "")
    .replace(
      /(\d{1,1})(\d{1,1})?(\d{1,1})?(\d{1,1})?(\d{1,1})?(\d{1,1})?/,
      "$1-$2-$3-$4-$5-$6"
    )
    .slice(0, 11);
}

export function OTPOutput(str: string) {
  return str.replace(/[^0-9]/g, "");
}

export function lowerCase(val: any) {
  return val.toString().trim().toLocaleLowerCase();
}
