export type AddressParts = {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

export const ZIP_PATTERN = '\\d{5}(-\\d{4})?';

export function formatAddress(parts: AddressParts): string {
  const street = parts.street?.trim();
  const city = parts.city?.trim();
  const state = parts.state?.trim()?.toUpperCase();
  const zip = parts.zip?.trim();
  const cityState = [city, state].filter(Boolean).join(', ');
  const cityStateZip = [cityState, zip].filter(Boolean).join(' ');
  return [street, cityStateZip].filter(Boolean).join(', ');
}

export function isCompleteAddress(parts: AddressParts): boolean {
  const zip = parts.zip?.trim() || '';
  return Boolean(
    parts.street?.trim() &&
      parts.city?.trim() &&
      parts.state?.trim() &&
      /^\d{5}(-\d{4})?$/.test(zip)
  );
}
