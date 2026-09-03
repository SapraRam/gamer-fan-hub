import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Flame,
  Gamepad2,
  Mail,
  Minus,
  Plus,
  Radio,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import bgImage from "@/assets/bg.jpg";
import avatarImage from "@/assets/avatar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaStrike — Send a Tip & On-Stream Alert" },
      {
        name: "description",
        content:
          "Support NovaStrike with a tip, drop a message and trigger a live on-stream alert. Instant, secure, no account needed.",
      },
      { property: "og:title", content: "NovaStrike — Send a Tip & On-Stream Alert" },
      {
        property: "og:description",
        content:
          "Support NovaStrike with a tip, drop a message and trigger a live on-stream alert.",
      },
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

function tierFor(amount: number) {
  if (amount >= 10000) return { cls: "tier-lime", name: "Legendary", max: 300 };
  if (amount >= 2000) return { cls: "tier-rose", name: "Mythic", max: 250 };
  if (amount >= 500) return { cls: "tier-amber", name: "Epic", max: 200 };
  if (amount >= 100) return { cls: "tier-cyan", name: "Rare", max: 120 };
  return { cls: "tier-violet", name: "Standard", max: 60 };
}

function formatShort(n: number) {
  return n >= 1000 ? `${n / 1000}k` : `${n}`;
}

function TipPage() {
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState<string | null>("hype");

  const tier = useMemo(() => tierFor(amount), [amount]);
  const canSend = amount >= 20 && email.includes("@");

  const step = (dir: 1 | -1) => {
    const inc = amount >= 1000 ? 500 : amount >= 100 ? 50 : 10;
    setAmount((a) => Math.max(20, Math.min(100000, a + dir * inc)));
  };

  return (
    <main className={`relative min-h-screen overflow-hidden ${tier.cls}`}>
      <img
        src={bgImage}
        alt=""
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 grid-lines opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      <div
        className="absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: "color-mix(in oklab, var(--tier) 22%, transparent)" }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_26rem] lg:gap-14 lg:py-20">
        {/* LEFT — creator */}
        <section className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-tier" />
            Live now · Valorant ranked grind
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="hud-corner rounded-2xl p-1">
              <img
                src={avatarImage}
                alt="NovaStrike avatar"
                width={512}
                height={512}
                loading="lazy"
                className="h-20 w-20 rounded-xl object-cover"
              />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-4xl font-bold sm:text-5xl">
                NovaStrike
                <BadgeCheck className="h-6 w-6 text-tier" />
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">@novastrike · YouTube Gaming</p>
            </div>
          </div>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Daily ranked grinds, chaotic customs and late-night scrims. Every tip pops up live on
            stream with your name, your message and the alert you pick.
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { icon: Users, k: "Subscribers", v: "1.2M" },
              { icon: Trophy, k: "Tournaments", v: "37" },
              { icon: Flame, k: "Tips today", v: "184" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-xl px-4 py-3">
                <s.icon className="h-4 w-4 text-tier" />
                <dd className="mt-2 font-display text-xl font-semibold">{s.v}</dd>
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.k}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>Stream goal · New capture card</span>
              <span className="text-tier">₹62,400 / ₹90,000</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: "69%",
                  background: "linear-gradient(90deg, var(--tier-soft), var(--tier))",
                }}
              />
            </div>
          </div>
        </section>

        {/* RIGHT — tip console */}
        <section className="glass tier-glow rounded-3xl p-5 transition-shadow duration-500">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Tip console
            </span>
            <span
              className="rounded-full px-2.5 py-1 font-display text-[11px] uppercase tracking-widest text-tier"
              style={{ background: "var(--tier-soft)" }}
            >
              {tier.name}
            </span>
          </div>

          {/* Amount dial */}
          <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Decrease amount"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-tier hover:text-tier"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-baseline justify-center gap-1">
                <span className="text-lg text-muted-foreground">₹</span>
                <input
                  value={amount}
                  inputMode="numeric"
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/\D/g, ""));
                    setAmount(Number.isFinite(v) ? Math.min(v, 100000) : 0);
                  }}
                  aria-label="Tip amount"
                  className="w-full max-w-[8rem] bg-transparent text-center font-display text-4xl font-bold text-foreground outline-none"
                />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  INR
                </span>
              </div>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Increase amount"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-tier hover:text-tier"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mx-auto mt-3 h-0.5 w-24 rounded-full bg-tier" />
          </div>

          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {PRESETS.map((p) => {
              const active = p === amount;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-lg py-2 text-xs transition-all ${
                    active
                      ? "border border-tier text-tier"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { background: "var(--tier-soft)" } : undefined}
                >
                  ₹{formatShort(p)}
                </button>
              );
            })}
          </div>

          {/* Identity + message */}
          <div className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full border-b border-border bg-transparent pb-2 font-display text-lg outline-none placeholder:text-muted-foreground focus:border-tier"
            />
            <div>
              <textarea
                value={message}
                maxLength={tier.max}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the stream..."
                rows={2}
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                <span>Higher tiers unlock longer messages</span>
                <span className="text-tier">
                  {message.length}/{tier.max}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="mt-4">
            <p className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Pick an on-stream alert
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {ALERTS.map((a) => {
                const active = alert === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAlert(active ? null : a.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-[11px] transition-all ${
                      active
                        ? "border-tier text-tier"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    style={active ? { background: "var(--tier-soft)" } : undefined}
                  >
                    <a.icon className="h-4 w-4" />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="email" className="font-medium">
                Email
              </label>
              <span className="text-muted-foreground">for your receipt only</span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-3 focus-within:border-tier">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!canSend}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "linear-gradient(100deg, var(--tier), color-mix(in oklab, var(--tier) 55%, var(--background)))",
            }}
          >
            Send ₹{amount.toLocaleString("en-IN")}
            <ArrowRight className="h-4 w-4" />
          </button>

          <nav className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <a href="#terms" className="underline-offset-4 hover:text-foreground hover:underline">
              Terms
            </a>
            <span className="text-tier">•</span>
            <a href="#refund" className="underline-offset-4 hover:text-foreground hover:underline">
              Refund
            </a>
            <span className="text-tier">•</span>
            <a href="#contact" className="underline-offset-4 hover:text-foreground hover:underline">
              Contact
            </a>
          </nav>
        </section>
      </div>
    </main>
  );
}
