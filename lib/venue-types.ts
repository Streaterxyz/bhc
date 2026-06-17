/**
 * Client-safe venue constants. Kept separate from lib/venue.ts (which imports
 * the DB client) so client components can import these without pulling
 * server-only database code into the browser bundle.
 */

export const VENUE_TYPES = [
  "restaurant",
  "bar",
  "cafe",
  "pub",
  "hotel",
] as const;

export type VenueType = (typeof VENUE_TYPES)[number];
