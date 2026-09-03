export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  watchUrl: string;
  isLive?: boolean;
}

export interface YouTubeChannelData {
  channelTitle: string;
  channelAvatarUrl: string;
  subscriberCount: number;
  subscriberLabel: string;
  liveStream: YouTubeVideoInfo | null;
  latestVideo: YouTubeVideoInfo | null;
  latestShort: YouTubeVideoInfo | null;
}

export interface YouTubeChannelResult {
  channel: YouTubeChannelData | null;
  cached: boolean;
  fetchedAt: string;
}
