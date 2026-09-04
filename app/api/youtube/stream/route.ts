import { headers } from "next/headers";

import { fetchYouTubeChannel } from "@/lib/youtube/api";

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

export async function GET() {
  const referer = await requestReferer();
  const result = await fetchYouTubeChannel(referer ? { referer } : {});
  const maxAge = result.channel?.liveStream ? 120 : 600;

  return Response.json(result, {
    headers: {
      "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}
