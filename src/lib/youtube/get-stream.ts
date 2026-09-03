import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

import { fetchYouTubeChannel } from "./api";
import type { YouTubeChannelResult } from "./types";

function requestReferer(): string | undefined {
  try {
    const url = getRequestUrl();
    return `${url.origin}/`;
  } catch {
    return undefined;
  }
}

export const getYouTubeChannel = createServerFn({ method: "GET" }).handler(
  async (): Promise<YouTubeChannelResult> => {
    try {
      return await fetchYouTubeChannel({ referer: requestReferer() });
    } catch (error) {
      console.error("[youtube] channel fetch failed:", error);
      return {
        channel: null,
        cached: false,
        fetchedAt: new Date().toISOString(),
      };
    }
  },
);

/** @deprecated Use getYouTubeChannel */
export const getYouTubeStream = getYouTubeChannel;
