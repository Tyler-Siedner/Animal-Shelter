// Authors: Tyler Siedner and Tyler Harris
export class InputError extends Error {}
export function text(
  value: unknown,
  label: string,
  min = 1,
  max = 2000,
): string {
  if (typeof value !== "string") throw new InputError(`${label} is required.`);
  const cleaned = value.trim();
  if (cleaned.length < min || cleaned.length > max)
    throw new InputError(
      `${label} must be between ${min} and ${max} characters.`,
    );
  return cleaned;
}
export function emailAddress(value: unknown): string {
  const email = text(value, "Email", 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new InputError("Enter a valid email address.");
  return email;
}
export function passwordValue(value: unknown): string {
  if (typeof value !== "string" || value.length < 10 || value.length > 128)
    throw new InputError("Use a password between 10 and 128 characters.");
  return value;
}
export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/account";
  if (/^\/volunteer\/apply\?opportunity=[a-z0-9-]+$/.test(value)) return value;
  return /^\/(account|favorites|applications|messages|admin(?:\/[a-z0-9-]+)*|animals(?:\/[a-z0-9-]+)?|adopt\/[a-z0-9-]+|volunteer(?:\/apply)?)$/.test(
    value,
  )
    ? value
    : "/account";
}
