import { createFileRoute } from "@tanstack/react-router";

import { fetchChannelAvatarBytes } from "@/lib/youtube/avatar";
import { CHANNEL_META_TTL_MS } from "@/lib/youtube/constants";

const CACHE_SECONDS = Math.floor(CHANNEL_META_TTL_MS / 1000);

export const Route = createFileRoute("/api/youtube/avatar")({
  server: {
    handlers: {
      GET: async () => {
        const avatar = await fetchChannelAvatarBytes();

        if (!avatar) {
          return new Response("Channel avatar not found", { status: 404 });
        }

        return new Response(avatar.body, {
          headers: {
            "Content-Type": avatar.contentType,
            "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
          },
        });
      },
    },
  },
});
