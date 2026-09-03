import { createFileRoute } from "@tanstack/react-router";

import { fetchYouTubeChannel } from "@/lib/youtube/api";

export const Route = createFileRoute("/api/youtube/stream")({
  server: {
    handlers: {
      GET: async () => {
        const result = await fetchYouTubeChannel();
        const maxAge = result.channel?.liveStream ? 120 : 600;

        return Response.json(result, {
          headers: {
            "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
          },
        });
      },
    },
  },
});
