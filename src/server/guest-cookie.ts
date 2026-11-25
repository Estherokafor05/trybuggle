// The anonymous guest ID kept in a cookie by the old open-access version of
// Module 1. Learning now needs an account, but results earned as a guest
// before that still move into the account the learner signs in with.
export const GUEST_COOKIE = "buggle_guest";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The guest learner ID from a raw cookie value, if it is a valid guest ID. */
export function guestIdFromValue(raw: string | undefined | null) {
  return raw && UUID.test(raw) ? `guest:${raw}` : null;
}

/** The guest learner ID from a request's Cookie header, if any. */
export function guestIdFromCookieHeader(header: string | undefined | null) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === GUEST_COOKIE) return guestIdFromValue(decodeURIComponent(value.join("=")));
  }
  return null;
}
