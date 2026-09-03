import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  Gamepad2,
  Mail,
  Minus,
  Play,
  Plus,
  Radio,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";

import { truncateTitle } from "@/lib/youtube/api";
import { CHANNEL_AVATAR_PATH } from "@/lib/youtube/constants";
import { getYouTubeChannel } from "@/lib/youtube/get-stream";

const portraitImage = "/images/alpha-ByD42gCA.jpg";

export const Route = createFileRoute("/")({
  loader: () => getYouTubeChannel(),
  head: () => ({
    meta: [
      { title: "Alpha Clasher — Send a Tip & On-Stream Alert" },
      {
        name: "description",
        content:
          "Support Alpha Clasher with a tip, drop a message and trigger a live on-stream alert. Instant, secure, no account needed.",
      },
      { property: "og:title", content: "Alpha Clasher — Send a Tip & On-Stream Alert" },
      {
        property: "og:description",
        content:
          "Support Alpha Clasher with a tip, drop a message and trigger a live on-stream alert.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TipPage,
});

const PRESETS = [40, 100, 500, 1000, 2000, 10000];

const ALERTS = [
  { id: "hype", label: "Hype", icon: Zap },
  { id: "clutch", label: "Clutch", icon: Trophy },
  { id: "fire", label: "Fire", icon: Flame },
  { id: "gg", label: "GG", icon: Gamepad2 },
];

const TIER_COLORS = {
  standard: { color: "#a855f7", accent: "#d8b4fe" },
  rare: { color: "#3b82f6", accent: "#93c5fd" },
  epic: { color: "#22c55e", accent: "#86efac" },
  mythic: { color: "#f97316", accent: "#fdba74" },
  legendary: { color: "#eab308", accent: "#fde047" },
} as const;

function tierFor(amount: number) {
  if (amount >= 10000)
    return { name: "Legendary", max: 300, ...TIER_COLORS.legendary };
  if (amount >= 2000) return { name: "Mythic", max: 250, ...TIER_COLORS.mythic };
  if (amount >= 500) return { name: "Epic", max: 200, ...TIER_COLORS.epic };
  if (amount >= 100) return { name: "Rare", max: 120, ...TIER_COLORS.rare };
  return { name: "Standard", max: 60, ...TIER_COLORS.standard };
}

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

function TipPage() {
  const youtube = Route.useLoaderData();
  const channel = youtube.channel;

  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState<string | null>("hype");

  const tier = useMemo(() => tierFor(amount), [amount]);
  const tierKey = tier.name.toLowerCase();
  const [tierPulse, setTierPulse] = useState(false);

  useEffect(() => {
    setTierPulse(true);
    const timer = window.setTimeout(() => setTierPulse(false), 650);
    return () => window.clearTimeout(timer);
  }, [tierKey]);

  const canSend = amount >= 20 && email.includes("@");

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  const channelName = channel?.channelTitle ?? "Alpha Clasher";
  const liveStream = channel?.liveStream;
  const latestVideo = channel?.latestVideo;
  const isLive = Boolean(liveStream);
  const hudVideo = liveStream ?? latestVideo;
  const streamTitle = hudVideo?.title ?? "BGMI ranked grind";
  const avatarUrl = channel?.channelAvatarUrl ?? CHANNEL_AVATAR_PATH;
  const hudThumbUrl = liveStream?.thumbnailUrl ?? latestVideo?.thumbnailUrl;
  const watchUrl =
    liveStream?.watchUrl ?? latestVideo?.watchUrl ?? "https://www.youtube.com/@AlphaClasher";

  const statCards = [
    {
      icon: Users,
      k: "Subscribers",
      v: channel?.subscriberLabel ?? "—",
      href: "https://www.youtube.com/@AlphaClasher",
    },
    {
      icon: Video,
      k: "Latest Video",
      v: latestVideo ? truncateTitle(latestVideo.title) : "—",
      href: latestVideo?.watchUrl,
      thumb: latestVideo?.thumbnailUrl,
    },
    {
      icon: Radio,
      k: isLive ? "Live Now" : "Live Stream",
      v: liveStream ? truncateTitle(liveStream.title) : "Offline",
      href: liveStream?.watchUrl,
      thumb: liveStream?.thumbnailUrl,
      isLive,
    },
  ];

  return (
    <main
      data-tier={tierKey}
      className="tier-theme relative flex h-dvh max-h-dvh w-full items-center justify-center overflow-hidden bg-background p-2 sm:p-3 lg:p-4"
    >
      <div
        className="tier-ambient pointer-events-none absolute h-[26rem] w-[26rem] rounded-full blur-[120px] opacity-45"
        style={{ backgroundColor: "var(--tier)" }}
      />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />

      <div
        className={`console-glow relative z-10 mx-auto flex h-[min(calc(100dvh-2rem),45rem)] w-[min(72rem,calc(100vw-2rem),calc((100dvh-2rem)*1.6))] max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-3xl lg:rounded-[2rem] ${tierPulse ? "tier-pulse" : ""}`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="tier-edge-glow tier-edge-glow-left" />
          <div className="tier-edge-glow tier-edge-glow-top" />
          <div className="tier-edge-glow tier-edge-glow-right" />
          <div className="tier-edge-glow tier-edge-glow-bottom" />
        </div>
        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          <section className="relative flex max-h-[32dvh] min-h-0 flex-col justify-end overflow-hidden lg:col-span-7 lg:max-h-none lg:h-full">
            <div className="absolute inset-0 z-0">
              <img
                src={portraitImage}
                alt="Alpha Clasher creator portrait"
                width={1024}
                height={1536}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
            </div>

            <div className="absolute left-5 top-5 z-20 w-[calc(100%-2.5rem)] max-w-xs lg:left-6 lg:top-6">
              <div className="glass flex items-center gap-3 rounded-2xl p-3 shadow-2xl lg:gap-3.5 lg:p-3.5">
                <div className="relative shrink-0">
                  <div className="hud-corner rounded-xl p-0.5">
                    <img
                      src={avatarUrl}
                      alt={`${channelName} avatar`}
                      width={96}
                      height={96}
                      className="h-11 w-11 rounded-lg object-cover lg:h-12 lg:w-12 lg:rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-background" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3 text-primary" />
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      {isLive ? "Live Now" : "Latest Video"}
                    </span>
                  </div>
                  <h2 className="mt-0.5 flex items-center gap-1.5 truncate font-display text-lg font-bold text-foreground">
                    {channelName}
                    <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                  </h2>
                  <p className="truncate text-[11px] text-muted-foreground">{streamTitle}</p>
                </div>
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-border sm:block"
                  aria-label={isLive ? "Watch live stream" : "Watch latest stream"}
                >
                  {hudThumbUrl ? (
                    <img
                      src={hudThumbUrl}
                      alt={isLive ? "Live stream preview" : "Latest video preview"}
                      width={256}
                      height={144}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/80">
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-5 w-5 fill-foreground text-foreground" />
                  </div>
                </a>
              </div>
            </div>

            <div className="relative z-10 p-4 lg:p-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {channelName}
              </h1>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <span>@alphaclasher</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>YouTube Gaming</span>
              </p>

              <p className="mt-3 max-w-md text-sm leading-snug text-muted-foreground lg:text-base">
                Daily ranked grinds, chaotic customs and late-night scrims. Every tip pops up live
                on stream with your name, your message and the alert you pick.
              </p>

              <dl className="mt-4 grid max-w-md grid-cols-3 gap-2 lg:gap-3">
                {statCards.map((s) => {
                  const hasThumb = "thumb" in s && s.thumb;
                  const inner = (
                    <>
                      {hasThumb ? (
                        <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-secondary/40">
                          <img
                            src={s.thumb}
                            alt=""
                            width={320}
                            height={180}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {"isLive" in s && s.isLive && (
                            <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                              Live
                            </span>
                          )}
                        </div>
                      ) : (
                        <s.icon className="h-4 w-4 text-primary" />
                      )}
                      <dd className="mt-2 truncate font-display text-sm font-semibold text-foreground sm:text-base">
                        {s.v}
                      </dd>
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {s.k}
                      </dt>
                    </>
                  );

                  return s.href ? (
                    <a
                      key={s.k}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-xl px-3 py-2.5 transition-colors hover:border-primary/40 lg:rounded-2xl lg:px-4 lg:py-3.5"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={s.k} className="glass rounded-xl px-3 py-2.5 lg:rounded-2xl lg:px-4 lg:py-3.5">
                      {inner}
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>

          <section className="tier-console relative flex min-h-0 flex-col justify-between overflow-hidden border-t border-border lg:col-span-5 lg:border-l lg:border-t-0">
            <div className="relative z-10 overflow-hidden px-4 py-4 lg:px-8 lg:py-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  Support Console
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--tier)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    Active
                  </span>
                </div>
              </div>

              <div className="tier-panel mt-3 rounded-2xl p-3.5 lg:rounded-3xl lg:p-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Decrease amount"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/80 text-muted-foreground hover:border-primary hover:text-foreground lg:h-11 lg:w-11 lg:rounded-2xl"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Tip Amount
                    </span>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1 font-display text-4xl font-bold text-foreground lg:text-5xl">
                      <span className="text-xl text-primary">₹</span>
                      <input
                        value={amount}
                        inputMode="numeric"
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, ""));
                          setAmount(Number.isFinite(v) ? Math.min(v, 100000) : 0);
                        }}
                        aria-label="Tip amount"
                        className="w-[5.5ch] bg-transparent text-center outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Increase amount"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/80 text-muted-foreground hover:border-primary hover:text-foreground lg:h-11 lg:w-11 lg:rounded-2xl"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-primary lg:mt-4 lg:w-20" />
              </div>

              <div className="mt-2.5 grid grid-cols-6 gap-1.5 lg:mt-3 lg:gap-2">
                {PRESETS.map((p) => {
                  const active = p === amount;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`rounded-lg py-2 text-[10px] font-bold lg:rounded-xl lg:py-2.5 lg:text-[11px] ${
                        active
                          ? "tier-select text-foreground"
                          : "border border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ₹{formatShort(p)}
                    </button>
                  );
                })}
              </div>

              <div className="tier-surface mt-3 space-y-3 rounded-2xl p-3.5 lg:mt-3.5 lg:p-4">
                <div>
                  <label
                    htmlFor="name"
                    className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Identity
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter display name..."
                    className="tier-input-bg mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary lg:mt-2 lg:px-4 lg:py-3"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    maxLength={tier.max}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={2}
                    className="tier-input-bg mt-1.5 w-full resize-none rounded-xl px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary lg:mt-2 lg:px-4 lg:py-3"
                  />
                  <div className="mt-1.5 flex items-center justify-end text-[10px] text-muted-foreground">
                    <span className="font-medium text-primary">
                      {message.length}/{tier.max}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 lg:mt-3.5">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  On-Stream Alert
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2 lg:gap-2.5">
                  {ALERTS.map((a) => {
                    const active = alert === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAlert(active ? null : a.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[9px] font-bold uppercase tracking-widest lg:gap-2 lg:rounded-2xl lg:py-3 lg:text-[10px] ${
                          active
                            ? "tier-select text-primary"
                            : "border-border bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <a.icon className="h-5 w-5" />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 lg:mt-3.5">
                <label
                  htmlFor="email"
                  className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Receipt Email
                </label>
                <div className="tier-surface mt-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 focus-within:border-primary lg:mt-2 lg:rounded-2xl lg:px-4 lg:py-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0 border-t border-border/40 px-4 pb-4 pt-3 lg:px-8 lg:pb-5 lg:pt-4">
              <button
                type="button"
                disabled={!canSend}
                className="tier-cta-glow flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-display text-xs font-black uppercase tracking-[0.2em] text-primary-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 lg:rounded-2xl lg:py-3.5 lg:text-sm lg:tracking-[0.25em]"
              >
                Deploy Tip ₹{amount.toLocaleString("en-IN")}
                <ArrowRight className="h-4 w-4" />
              </button>

              <nav className="mt-3 flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground lg:gap-6 lg:text-[10px] lg:tracking-[0.2em]">
                <a href="#terms" className="transition-colors hover:text-foreground">
                  Privacy
                </a>
                <a href="#refund" className="transition-colors hover:text-foreground">
                  Refunds
                </a>
                <a href="#contact" className="transition-colors hover:text-foreground">
                  Support
                </a>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
