import { readCache, writeCache } from "./cache";
import { CHANNEL_AVATAR_PATH, CHANNEL_META_TTL_MS } from "./constants";

const AVATAR_BYTES_CACHE_KEY = "youtube:channel-avatar-bytes";
const CHANNEL_PAGE_URL = "https://www.youtube.com/@AlphaClasher";

interface AvatarBytesCache {
  contentType: string;
  bodyBase64: string;
  sourceUrl: string;
}

function decodeHtmlUrl(url: string): string {
  return url
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function resolveChannelAvatarSourceUrl(): Promise<string> {
  const response = await fetch(CHANNEL_PAGE_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "Mozilla/5.0 (compatible; GamerFanHub/1.0)",
    },
  });

  if (!response.ok) return "";

  const html = await response.text();

  const candidates = [
    html.match(/property="og:image" content="([^"]+)"/)?.[1],
    html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/)?.[1],
    html.match(/"width":900,"height":900,"url":"(https:\/\/yt3[^"]+)"/)?.[1],
  ];

  for (const candidate of candidates) {
    if (candidate) return decodeHtmlUrl(candidate);
  }

  return "";
}

export async function warmChannelAvatarCache(sourceUrl: string): Promise<void> {
  if (!sourceUrl || sourceUrl === CHANNEL_AVATAR_PATH) return;
  await fetchChannelAvatarBytes(sourceUrl);
}

export async function fetchChannelAvatarBytes(
  sourceUrl?: string,
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const cached = readCache<AvatarBytesCache>(AVATAR_BYTES_CACHE_KEY);
  if (cached) {
    return {
      body: base64ToBytes(cached.bodyBase64),
      contentType: cached.contentType,
    };
  }

  const resolvedUrl = sourceUrl ?? (await resolveChannelAvatarSourceUrl());
  if (!resolvedUrl) return null;

  const response = await fetch(resolvedUrl, {
    headers: { Accept: "image/*" },
  });

  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const body = new Uint8Array(await response.arrayBuffer());

  writeCache(
    AVATAR_BYTES_CACHE_KEY,
    {
      contentType,
      bodyBase64: bytesToBase64(body),
      sourceUrl: resolvedUrl,
    },
    CHANNEL_META_TTL_MS,
  );

  return { body, contentType };
}
