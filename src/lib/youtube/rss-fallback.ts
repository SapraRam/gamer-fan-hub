import { YOUTUBE_CHANNEL_ID } from "./constants";
import type { YouTubeChannelData, YouTubeVideoInfo } from "./types";

const CHANNEL_PAGE_URL = "https://www.youtube.com/@AlphaClasher";
const RSS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

interface ParsedEntry {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  isShort: boolean;
}

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function parseRssEntries(xml: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];

  for (const block of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = block[1];
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    const thumbnailUrl =
      entry.match(/<media:thumbnail url="([^"]+)"/)?.[1] ??
      entry.match(/url="(https:\/\/i\d\.ytimg\.com\/vi\/[^"]+)"/)?.[1];

    if (!videoId || !title) continue;

    const normalizedTitle = decodeXml(title);
    const isShort =
      /#shorts/i.test(normalizedTitle) ||
      /\/shorts\//i.test(entry) ||
      normalizedTitle.toLowerCase().includes("short");

    entries.push({
      videoId,
      title: normalizedTitle,
      thumbnailUrl: thumbnailUrl ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      isShort,
    });
  }

  return entries;
}

function toVideoInfo(entry: ParsedEntry, isLive = false): YouTubeVideoInfo {
  return {
    videoId: entry.videoId,
    title: entry.title,
    thumbnailUrl: entry.thumbnailUrl,
    watchUrl: entry.isShort
      ? `https://www.youtube.com/shorts/${entry.videoId}`
      : `https://www.youtube.com/watch?v=${entry.videoId}`,
    isLive,
  };
}

function parseSubscriberLabel(label: string): string {
  const match = label.match(
    /([\d,.]+)\s*(thousand|million|billion|k|m|b)?\s*subscriber/i,
  );
  if (!match) return label.replace(/\s*subscribers?$/i, "").trim();

  const num = Number.parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2]?.toLowerCase();

  if (unit === "thousand" || unit === "k") return `${num >= 10 ? Math.round(num) : num}k`;
  if (unit === "million" || unit === "m") return `${num >= 10 ? Math.round(num) : num}M`;
  if (unit === "billion" || unit === "b") return `${num}B`;
  return String(num);
}

function parseSubscriberCount(label: string): number {
  const match = label.match(
    /([\d,.]+)\s*(thousand|million|billion|k|m|b)?\s*subscriber/i,
  );
  if (!match) return 0;

  const num = Number.parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2]?.toLowerCase();

  if (unit === "thousand" || unit === "k") return Math.round(num * 1000);
  if (unit === "million" || unit === "m") return Math.round(num * 1_000_000);
  if (unit === "billion" || unit === "b") return Math.round(num * 1_000_000_000);
  return Math.round(num);
}

function decodeHtmlUrl(url: string): string {
  return url.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").trim();
}

function scrapeChannelMeta(html: string) {
  const channelTitle =
    html.match(/property="og:title" content="([^"]+)"/)?.[1]?.replace(/ - YouTube$/, "") ??
    "Alpha Clasher";

  const channelAvatarUrl =
    decodeHtmlUrl(html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? "") ||
    decodeHtmlUrl(html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/)?.[1] ?? "");

  const subscriberLabelRaw =
    html.match(
      /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/,
    )?.[1] ?? "";

  const subscriberLabel = subscriberLabelRaw
    ? parseSubscriberLabel(subscriberLabelRaw)
    : "—";

  const subscriberCount = subscriberLabelRaw
    ? parseSubscriberCount(subscriberLabelRaw)
    : 0;

  return { channelTitle, channelAvatarUrl, subscriberLabel, subscriberCount };
}

/**
 * No API key required — used when the YouTube Data API key is missing or blocked.
 * Live status is not available via RSS; latest upload is shown instead.
 */
export async function fetchYouTubeChannelViaRss(): Promise<YouTubeChannelData> {
  const [rssResponse, pageResponse] = await Promise.all([
    fetch(RSS_FEED_URL, {
      headers: { Accept: "application/atom+xml, application/xml, text/xml" },
    }),
    fetch(CHANNEL_PAGE_URL, {
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 (compatible; GamerFanHub/1.0)",
      },
    }),
  ]);

  if (!rssResponse.ok) {
    throw new Error(`YouTube RSS feed failed (${rssResponse.status})`);
  }

  const rssXml = await rssResponse.text();
  const entries = parseRssEntries(rssXml);

  let latestVideo: YouTubeVideoInfo | null = null;
  let latestShort: YouTubeVideoInfo | null = null;

  for (const entry of entries) {
    if (entry.isShort && !latestShort) {
      latestShort = toVideoInfo(entry);
    } else if (!entry.isShort && !latestVideo) {
      latestVideo = toVideoInfo(entry);
    }
    if (latestVideo && latestShort) break;
  }

  let channelTitle = "Alpha Clasher";
  let channelAvatarUrl = "";
  let subscriberLabel = "—";
  let subscriberCount = 0;

  if (pageResponse.ok) {
    const pageHtml = await pageResponse.text();
    const scraped = scrapeChannelMeta(pageHtml);
    channelTitle = scraped.channelTitle;
    channelAvatarUrl = scraped.channelAvatarUrl;
    subscriberLabel = scraped.subscriberLabel;
    subscriberCount = scraped.subscriberCount;
  }

  return {
    channelTitle,
    channelAvatarUrl,
    subscriberCount,
    subscriberLabel,
    liveStream: null,
    latestVideo,
    latestShort,
  };
}
