"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Mail, Minus, Plus, Radio, Users, Video } from "lucide-react";

import { truncateTitle } from "@/lib/youtube/api";
import type { YouTubeChannelResult } from "@/lib/youtube/types";

const portraitImage = "/images/alpha-ByD42gCA.jpg";

const PRESETS = [40, 100, 500, 1000, 2000, 10000];

const TIER_COLORS = {
  standard: { color: "#a855f7", accent: "#d8b4fe" },
  rare: { color: "#3b82f6", accent: "#93c5fd" },
  epic: { color: "#22c55e", accent: "#86efac" },
  mythic: { color: "#f97316", accent: "#fdba74" },
  legendary: { color: "#eab308", accent: "#fde047" },
} as const;

function tierFor(amount: number) {
  if (amount >= 10000) return { name: "Legendary", max: 300, ...TIER_COLORS.legendary };
  if (amount >= 2000) return { name: "Mythic", max: 250, ...TIER_COLORS.mythic };
  if (amount >= 500) return { name: "Epic", max: 200, ...TIER_COLORS.epic };
  if (amount >= 100) return { name: "Rare", max: 120, ...TIER_COLORS.rare };
  return { name: "Standard", max: 60, ...TIER_COLORS.standard };
}

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

export default function TipPage({ youtube }: { youtube: YouTubeChannelResult }) {
  const channel = youtube.channel;

  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const tier = useMemo(() => tierFor(amount), [amount]);
  const tierKey = tier.name.toLowerCase();
  const [tierPulse, setTierPulse] = useState(false);

  useEffect(() => {
    setTierPulse(true);
    const timer = window.setTimeout(() => setTierPulse(false), 750);
    return () => window.clearTimeout(timer);
  }, [tierKey]);

  const canSend = amount >= 20 && email.includes("@");

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  const channelName = channel?.channelTitle ?? "Alpha Clasher";

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
      v: channel?.latestVideo ? truncateTitle(channel.latestVideo.title) : "—",
      href: channel?.latestVideo?.watchUrl,
    },
    {
      icon: Radio,
      k: "Live Stream",
      v: channel?.liveStream ? truncateTitle(channel.liveStream.title) : "Offline",
      href: channel?.liveStream?.watchUrl,
    },
  ];

  return (
    <main
      data-tier={tierKey}
      className="tier-theme starry-sky relative flex h-dvh max-h-dvh w-full items-center justify-center overflow-hidden p-2 sm:p-3 lg:p-4"
    >
      <div
        className="tier-ambient pointer-events-none absolute z-[1] h-[26rem] w-[26rem] rounded-full blur-[120px] opacity-30"
        style={{ backgroundColor: "var(--tier)" }}
      />

      <div
        className={`console-glow relative z-10 mx-auto flex h-[min(760px,calc(100dvh-2rem))] max-h-[min(760px,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-3xl lg:rounded-[2rem] ${tierPulse ? "tier-pulse" : ""}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
          aria-hidden="true"
        >
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
                on stream with your name and your message.
              </p>

              <dl className="mt-4 grid max-w-md grid-cols-3 gap-2 lg:gap-3">
                {statCards.map((s) => {
                  const inner = (
                    <>
                      <s.icon className="h-4 w-4 text-primary" />
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
                    <div
                      key={s.k}
                      className="glass rounded-xl px-3 py-2.5 lg:rounded-2xl lg:px-4 lg:py-3.5"
                    >
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
