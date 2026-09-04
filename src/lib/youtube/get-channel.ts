import { headers } from "next/headers";

import { fetchYouTubeChannel } from "./api";
import type { YouTubeChannelResult } from "./types";

async function requestReferer(): Promise<string | undefined> {
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (!host) return undefined;
    const proto = headerList.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}/`;
  } catch {
    return undefined;
  }
}

export async function getYouTubeChannel(): Promise<YouTubeChannelResult> {
  try {
    const referer = await requestReferer();
    return await fetchYouTubeChannel(referer ? { referer } : {});
  } catch (error) {
    console.error("[youtube] channel fetch failed:", error);
    return {
      channel: null,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  }
}

/** @deprecated Use getYouTubeChannel */
export const getYouTubeStream = getYouTubeChannel;
