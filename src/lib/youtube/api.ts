import {
  CHANNEL_AVATAR_PATH,
  CHANNEL_META_TTL_MS,
  CONTENT_CACHE_TTL_MS,
  LIVE_CACHE_TTL_MS,
  LIVE_SEARCH_OFFLINE_TTL_MS,
  YOUTUBE_CHANNEL_ID,
} from "./constants";
import { warmChannelAvatarCache } from "./avatar";
import { readCache, writeCache } from "./cache";
import { fetchYouTubeChannelViaRss } from "./rss-fallback";
import type { YouTubeChannelData, YouTubeChannelResult, YouTubeVideoInfo } from "./types";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

interface ChannelMeta {
  uploadsPlaylistId: string;
  shortsPlaylistId: string;
  channelTitle: string;
  channelAvatarUrl: string;
  subscriberCount: number;
}

type Thumbnails = {
  maxres?: { url: string };
  standard?: { url: string };
  high?: { url: string };
  medium?: { url: string };
  default?: { url: string };
};

let activeFetchReferer: string | undefined;

async function youtubeGet<T>(
  path: string,
  params: Record<string, string>,
  options?: { referer?: string },
): Promise<T> {
  const apiKey = process.env["YOUTUBE_API_KEY"];
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const url = new URL(`${YOUTUBE_API}${path}`);
  url.searchParams.set("key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const referer = options?.referer ?? activeFetchReferer ?? process.env["YOUTUBE_API_REFERER"];
  if (referer) {
    headers["Referer"] = referer.endsWith("/") ? referer : `${referer}/`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 403 && body.includes("API_KEY_HTTP_REFERRER_BLOCKED")) {
      throw new Error(
        `YouTube API key is blocked for server requests (HTTP referrer restriction). ` +
          `In Google Cloud Console, set Application restrictions to "None" for this key, ` +
          `or add your site URL to HTTP referrers and set YOUTUBE_API_REFERER in .env. ` +
          `Raw: ${body}`,
      );
    }
    throw new Error(`YouTube API ${path} failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

function pickThumbnail(thumbnails?: Thumbnails): string {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) {
    const m = count / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const k = count / 1_000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

function truncateTitle(title: string, max = 28): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max - 1).trim()}…`;
}

export { truncateTitle };

async function withProxiedAvatar(channel: YouTubeChannelData): Promise<YouTubeChannelData> {
  if (channel.channelAvatarUrl) {
    await warmChannelAvatarCache(channel.channelAvatarUrl);
  }
  return { ...channel, channelAvatarUrl: CHANNEL_AVATAR_PATH };
}

function toVideoInfo(
  videoId: string,
  title: string,
  thumbnails?: Thumbnails,
  isLive = false,
): YouTubeVideoInfo {
  return {
    videoId,
    title,
    thumbnailUrl: pickThumbnail(thumbnails),
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    isLive,
  };
}

async function getChannelMeta(): Promise<ChannelMeta> {
  const cached = readCache<ChannelMeta>("youtube:channel-meta");
  if (cached) return cached;

  const data = await youtubeGet<{
    items?: Array<{
      snippet: {
        title: string;
        thumbnails?: Thumbnails;
      };
      statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
      contentDetails: {
        relatedPlaylists: {
          uploads: string;
          shortUploads?: string;
        };
      };
    }>;
  }>("/channels", {
    part: "snippet,contentDetails,statistics",
    id: YOUTUBE_CHANNEL_ID,
  });

  const channel = data.items?.[0];
  if (!channel) {
    throw new Error("YouTube channel not found");
  }

  const meta: ChannelMeta = {
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    shortsPlaylistId: channel.contentDetails.relatedPlaylists.shortUploads ?? "",
    channelTitle: channel.snippet.title,
    channelAvatarUrl:
      channel.snippet.thumbnails?.high?.url ??
      channel.snippet.thumbnails?.default?.url ??
      "",
    subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
  };

  writeCache("youtube:channel-meta", meta, CHANNEL_META_TTL_MS);
  return meta;
}

async function getPlaylistLatestVideo(playlistId: string): Promise<string | null> {
  if (!playlistId) return null;

  const data = await youtubeGet<{
    items?: Array<{ snippet: { resourceId: { videoId: string } } }>;
  }>("/playlistItems", {
    part: "snippet",
    playlistId,
    maxResults: "1",
  });

  return data.items?.[0]?.snippet.resourceId.videoId ?? null;
}

async function getVideosByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const data = await youtubeGet<{
    items?: Array<{
      id: string;
      snippet: {
        title: string;
        liveBroadcastContent?: "live" | "none" | "upcoming";
        thumbnails?: Thumbnails;
      };
    }>;
  }>("/videos", {
    part: "snippet",
    id: ids.join(","),
  });

  return data.items ?? [];
}

async function fetchLiveStreamSearch(): Promise<YouTubeVideoInfo | null> {
  const cached = readCache<{ value: YouTubeVideoInfo | null }>("youtube:live-search");
  if (cached) return cached.value;

  const data = await youtubeGet<{
    items?: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails?: Thumbnails;
        liveBroadcastContent?: "live" | "none" | "upcoming";
      };
    }>;
  }>("/search", {
    part: "snippet",
    channelId: YOUTUBE_CHANNEL_ID,
    eventType: "live",
    type: "video",
    maxResults: "1",
    order: "date",
  });

  const item = data.items?.[0];
  const live =
    item && item.snippet.liveBroadcastContent === "live"
      ? toVideoInfo(item.id.videoId, item.snippet.title, item.snippet.thumbnails, true)
      : null;

  writeCache(
    "youtube:live-search",
    { value: live },
    live ? LIVE_CACHE_TTL_MS : LIVE_SEARCH_OFFLINE_TTL_MS,
  );
  return live;
}

/**
 * Quota per uncached refresh (typical):
 * - channels.list: 1
 * - playlistItems x2: 2
 * - videos.list (batched): 1
 * - search.list (live, cached 2–15 min): 100 when cache expires
 */
export async function fetchYouTubeChannel(options?: { referer?: string }): Promise<YouTubeChannelResult> {
  const cached = readCache<YouTubeChannelData>("youtube:channel-bundle");
  if (cached) {
    return {
      channel: { ...cached, channelAvatarUrl: CHANNEL_AVATAR_PATH },
      cached: true,
      fetchedAt: new Date().toISOString(),
    };
  }

  try {
    activeFetchReferer = options?.referer;
    return await fetchYouTubeChannelViaApi();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[youtube] API unavailable, using RSS fallback:", message);
    const channel = await withProxiedAvatar(await fetchYouTubeChannelViaRss());
    writeCache("youtube:channel-bundle", channel, CONTENT_CACHE_TTL_MS);
    return {
      channel,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    activeFetchReferer = undefined;
  }
}

async function fetchYouTubeChannelViaApi(): Promise<YouTubeChannelResult> {

  const meta = await getChannelMeta();

  const [uploadVideoId, shortVideoId, liveFromSearch] = await Promise.all([
    getPlaylistLatestVideo(meta.uploadsPlaylistId),
    getPlaylistLatestVideo(meta.shortsPlaylistId),
    fetchLiveStreamSearch(),
  ]);

  const videoIds = [uploadVideoId, shortVideoId].filter((id): id is string => Boolean(id));
  const videos = await getVideosByIds(videoIds);

  const byId = new Map(videos.map((v) => [v.id, v]));

  let latestVideo: YouTubeVideoInfo | null = null;
  if (uploadVideoId && byId.has(uploadVideoId)) {
    const v = byId.get(uploadVideoId)!;
    latestVideo = toVideoInfo(
      v.id,
      v.snippet.title,
      v.snippet.thumbnails,
      v.snippet.liveBroadcastContent === "live",
    );
  }

  let latestShort: YouTubeVideoInfo | null = null;
  if (shortVideoId && byId.has(shortVideoId)) {
    const v = byId.get(shortVideoId)!;
    latestShort = toVideoInfo(v.id, v.snippet.title, v.snippet.thumbnails);
  }

  const liveStream =
    liveFromSearch ??
    (latestVideo?.isLive ? latestVideo : null);

  const channel = await withProxiedAvatar({
    channelTitle: meta.channelTitle,
    channelAvatarUrl: meta.channelAvatarUrl,
    subscriberCount: meta.subscriberCount,
    subscriberLabel: formatSubscriberCount(meta.subscriberCount),
    liveStream,
    latestVideo,
    latestShort,
  });

  const ttl = liveStream ? LIVE_CACHE_TTL_MS : CONTENT_CACHE_TTL_MS;
  writeCache("youtube:channel-bundle", channel, ttl);

  return {
    channel,
    cached: false,
    fetchedAt: new Date().toISOString(),
  };
}

/** @deprecated Use fetchYouTubeChannel */
export async function fetchYouTubeStream(): Promise<YouTubeChannelResult> {
  return fetchYouTubeChannel();
}
