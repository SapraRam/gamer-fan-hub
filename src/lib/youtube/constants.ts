/** Alpha Clasher — https://www.youtube.com/@AlphaClasher */
export const YOUTUBE_CHANNEL_ID = "UC-toBXJuoumnoRFK26Vvs8Q";

/** Proxied channel avatar — browser + server cached for 24h. */
export const CHANNEL_AVATAR_PATH = "/api/youtube/avatar";

/** Channel playlists + avatar + subscriber count — rarely changes. */
export const CHANNEL_META_TTL_MS = 24 * 60 * 60 * 1000;

/** Live HUD refresh while broadcasting. */
export const LIVE_CACHE_TTL_MS = 2 * 60 * 1000;

/** Latest video / short / offline live check. */
export const CONTENT_CACHE_TTL_MS = 10 * 60 * 1000;

/** Live search is 100 quota units — cache aggressively when offline. */
export const LIVE_SEARCH_OFFLINE_TTL_MS = 15 * 60 * 1000;
