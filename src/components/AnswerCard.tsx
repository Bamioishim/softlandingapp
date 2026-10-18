import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  MapPin,
  Cpu,
  Coffee,
  Music,
  Utensils,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import type { AgentResult, AgentStep, NeighborhoodMatch, Place } from "@/lib/agent";
import { Button } from "./Button";
import { supabase } from "@/integrations/supabase/client";
import { resolveCity } from "@/lib/cities";

export function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border p-5">
      <Button
        variant="plain"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm"
      >
        <span className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && <div className="mt-5 border-t pt-5">{children}</div>}
    </div>
  );
}
export function StepList({ steps, pending }: { steps: AgentStep[]; pending?: boolean }) {
  return (
    <ol className="space-y-3 text-sm">
      {steps.map((s, i) => (
        <li key={i} className="animate-rise flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="flex-1">{s.label}</span>
          <span className="text-xs text-muted-foreground">{(s.ms / 1000).toFixed(2)}s</span>
        </li>
      ))}
      {pending && (
        <li className="flex items-center gap-3 text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border border-foreground border-t-transparent" />
          Finding your corner of the city…
        </li>
      )}
    </ol>
  );
}
const label = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const FIT_LINES: Record<string, string> = {
  "Bed-Stuy": "Brownstones, bold flavors, and a deep music scene.",
  Harlem: "Live jazz and West African flavors on your doorstep.",
  "Crown Heights": "Caribbean comfort with room in your budget.",
  Astoria: "Quiet café mornings and independent cinema.",
  Williamsburg: "Specialty coffee meets an indie creative scene.",
  "Jackson Heights": "A world of flavors at neighborhood prices.",
  "Lower East Side": "Cinema, streetwear, and nights that run late.",
  "Park Slope": "Leafy streets, bookshops, and slow mornings.",
  Peckham: "Bold flavors and music with a community heartbeat.",
  Hackney: "Independent cinema, great coffee, and warehouse gigs.",
  Hampstead: "Village lanes and unhurried bookshop afternoons.",
  "Little Jamaica": "Reggae, Caribbean flavors, and real community.",
  "Kensington Market": "Vintage finds and affordable café afternoons.",
  "The Annex": "Bookshops and cinema among Victorian homes.",
  Neukölln: "Canal-side evenings and affordable food discoveries.",
  Kreuzberg: "Street art, late bites, and a music-first spirit.",
  "Prenzlauer Berg": "Leafy squares and leisurely café Sundays.",
  "Al Karama": "South Asian flavors without the big-city price tag.",
  "Jumeirah Lake Towers": "Lakeside coffee with nightlife close by.",
  "Al Barsha": "A calmer base with cafés and cinema nearby.",
  Yaba: "Creative energy, local flavors, and friendly cafés.",
  "Lekki Phase 1": "Beachside nights with an Afrobeats soundtrack.",
  "Ikeja GRA": "Leafy streets and a quieter everyday rhythm.",
};
export function NeighborhoodCard({
  n,
  city,
  index = 0,
}: {
  n: NeighborhoodMatch;
  city: string;
  index?: number;
}) {
  // Only the card's own Qloo place photo is shown; without one, a plain cream card with the name.
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [n.image]);
  const tags = [...new Set([...n.matched, ...n.tags])].slice(0, 3);
  return (
    <article className="neighborhood-card min-w-0" data-index={index}>
      <div className="neighborhood-image-wrap">
        {n.image && !broken ? (
          <img
            src={n.image}
            alt={n.imageAlt ? `${n.imageAlt}, ${n.name}` : n.name}
            className="neighborhood-photo"
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center p-6 text-center">
            <span className="font-display text-3xl">{n.name}</span>
          </div>
        )}
        {n.scoreAvailable !== false && <span className="match-badge">
          <span className="match-dot" /> <strong>{n.score}%</strong> match
        </span>}
        {n.image && !broken && <span className="photo-credit">{n.imageAlt ?? "Photo"} · Qloo</span>}
        <span className="sr-only">{city}</span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-2">
        <h3 className="neighborhood-name">{n.name}</h3>
        <ArrowUpRight className="mt-2 h-4 w-4 shrink-0" />
      </div>
      <p className="eyebrow mt-2 text-muted-foreground">
        {city} · {n.borough}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span className="outline-tag" key={t}>
            {label(t)}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {n.matched.length
          ? `A local rhythm for your love of ${n.matched.slice(0, 2).join(" and ")}.`
          : FIT_LINES[n.name] ?? n.why}
      </p>
      <p className="mt-4 border-t pt-3 text-xs">
        <span className="text-muted-foreground">Rent · 1BR </span>
        {n.rentRange}
      </p>
    </article>
  );
}
function PlaceCard({ p }: { p: Place }) {
  const Icon =
    p.category === "Cafe"
      ? Coffee
      : p.category === "Venue"
        ? Music
        : p.category === "Shop"
          ? ShoppingBag
          : Utensils;
  const price = p.tags.includes("budget") ? "$" : "$$";
  return (
    <article className="flex gap-4 rounded-2xl border p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2">
          <h4 className="text-2xl leading-none">{p.name}</h4>
          <span className="text-xs text-muted-foreground">{price}</span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          {p.category} · <MapPin className="h-3 w-3 shrink-0" />
          {p.neighborhood}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.reason}</p>
      </div>
    </article>
  );
}
export function Timeline({ plan, city, visiting = false }: { plan: AgentResult["plan"]; city: string; visiting?: boolean }) {
  const storageKey = `soft-landing:plan:${city}:${plan.map((w) => w.items.join("|")).join("||")}`;
  const [state, setState] = useState<{ key: string; done: string[] }>({ key: "", done: [] });
  useEffect(() => {
    let done: string[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(raw)) done = raw.filter((v): v is string => typeof v === "string");
    } catch {}
    setState({ key: storageKey, done });
  }, [storageKey]);
  useEffect(() => {
    if (state.key !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.done));
    } catch {}
  }, [state, storageKey]);
  const done = state.key === storageKey ? state.done : [];
  const total = plan.reduce((a, w) => a + w.items.length, 0);
  const toggle = (key: string) =>
    setState((s) => ({
      key: storageKey,
      done: s.done.includes(key) ? s.done.filter((k) => k !== key) : [...s.done, key],
    }));
  return (
    <section className="plan-panel">
      <div>
        <p className="eyebrow text-muted-foreground">Your plan</p>
        <h2 className="section-title mt-5">
          {visiting ? <>Your trip, <em>day by day.</em></> : <>Your first <em>30 days</em>, sorted.</>}
        </h2>
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {visiting
            ? `Make the most of every day in ${city}, one stop at a time.`
            : `A little less unknown. A few more familiar faces. One small step at a time in ${city}.`}
        </p>
        <div
          className="mt-8 h-1 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-label="Plan progress"
          aria-valuenow={done.length}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${total ? (done.length / total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {done.length} of {total} little steps complete
        </p>
      </div>
      <div className="plan-weeks">
        {plan.map((w) => (
          <div key={w.week} className="plan-week">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="font-display text-3xl">{w.week}</h3>
              <span className="text-[10px] text-muted-foreground">
                {w.items.filter((it) => done.includes(`${w.week}|${it}`)).length} / {w.items.length}
              </span>
            </div>
            {w.items.map((it) => {
              const key = `${w.week}|${it}`;
              const checked = done.includes(key);
              return (
                <Button
                  key={key}
                  variant="plain"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(key)}
                  className="plan-item flex w-full items-center gap-3 border-b py-4 text-left text-[13px] leading-relaxed"
                >
                  <span
                    className={`plan-check ${checked ? "bg-foreground text-primary-foreground" : ""}`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className={`flex-1 ${checked ? "text-muted-foreground line-through" : ""}`}>
                    {it}
                  </span>
                </Button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
export function AnswerCard({ r, onChooseCity }: { r: AgentResult; onChooseCity?: (name: string) => void }) {
  const [requestState, setRequestState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const requestCity = async () => {
    const city = resolveCity(r.city)?.city;
    if (!city || requestState === "saving" || requestState === "saved") return;
    setRequestState("saving");
    try {
      const { error } = await supabase.from("city_requests").insert({ city: city.name, country: city.country });
      setRequestState(error ? "error" : "saved");
    } catch { setRequestState("error"); }
  };
  if (r.status === "unavailable" || r.status === "error") return (
    <div className="animate-rise space-y-6">
      <p role="status" className="text-base">{r.summary}</p>
      {r.status === "unavailable" && <>
        <div className="flex flex-wrap gap-3">{r.alternatives?.map((c) => <Button key={c.name} onClick={() => onChooseCity?.(c.name)} title={c.reason}>{c.name}<ArrowUpRight className="h-4 w-4" /></Button>)}</div>
        {r.alternatives?.map((c) => <p key={c.name} className="text-xs text-muted-foreground">{c.name} · {c.reason}</p>)}
        <Button onClick={requestCity} disabled={requestState === "saving" || requestState === "saved"}>{requestState === "saved" ? `Requested ${r.city}` : requestState === "saving" ? "Saving…" : `Request ${r.city}`}</Button>
        {requestState === "error" && <p role="alert" className="text-xs">Could not save your request. Please try again.</p>}
      </>}
      <Collapsible title="Agent steps"><StepList steps={r.steps} /></Collapsible>
    </div>
  );
  return (
    <div className="animate-rise space-y-10">
      <div>
        <p className="eyebrow text-muted-foreground">
          {r.source === "sample" ? "Sample recommendations" : r.mode === "qloo" ? "Qloo-grounded answer" : "Without Qloo"}
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed">{r.summary}</p>
        {r.source === "sample" && (
          <p role="note" className="mt-4 inline-block rounded-xl border px-4 py-2 text-xs">
            Sample data, not from Qloo
          </p>
        )}
      </div>
      {r.neighborhoods.length > 0 && <div>
        <h2 className="mb-6 font-display text-4xl">
          Neighborhoods that <em>get you.</em>
        </h2>
        <div className="grid gap-7 md:grid-cols-3">
          {r.neighborhoods.map((n, i) => (
            <NeighborhoodCard key={n.name} n={n} city={r.city} index={i} />
          ))}
        </div>
      </div>}
      {r.places.length > 0 && <div>
        <h2 className="mb-6 font-display text-4xl">
          Your new <em>regular spots.</em>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {r.places.map((p) => (
            <PlaceCard key={p.name} p={p} />
          ))}
        </div>
      </div>}
      <Timeline plan={r.plan} city={r.city} visiting={r.trip === "visiting"} />
      <Collapsible title="Agent steps">
        <StepList steps={r.steps} />
      </Collapsible>
    </div>
  );
}
