import { useServerFn } from "@tanstack/react-start";
import { getQlooRecommendations } from "@/lib/agent.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Square,
  X,
  Menu,
  ArrowUpRight,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { TASTE_CHIPS, type Prefs } from "@/lib/qloo";
import { runAgent, type AgentResult, type AgentStep, type Mode } from "@/lib/agent";
import { flagForCountry, resolveCity, type CityResolution } from "@/lib/cities";
import { CITY_DATA } from "@/lib/city-data";
import { CityPicker } from "@/components/CityPicker";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-speech";
import { AnswerCard, NeighborhoodCard, StepList, Timeline, Collapsible } from "@/components/AnswerCard";
import { Button } from "@/components/Button";
import { cityPhoto, DEFAULT_PANEL_PHOTO, HERO_PHOTOS } from "@/lib/photos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Soft Landing — Move anywhere, feel at home." },
      {
        name: "description",
        content:
          "The calm side of a new city. Find neighborhoods, local favorites and a first-30-days plan matched to your taste.",
      },
      { property: "og:title", content: "Soft Landing — Move anywhere, feel at home." },
      {
        property: "og:description",
        content:
          "Taste-matched neighborhoods, places and your first 30 days, one little step at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
const EXAMPLES = [
  "I love Afrobeats, spicy food and I'm on a student budget. Where should I live?",
  "I'm into indie films, coffee shops and quiet streets.",
  "Hip-hop, sneakers, late-night food, mid budget.",
];
type Msg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; result?: AgentResult; error?: string; steps: AgentStep[] };
function tasteMessage(msgs: Msg[]) { return [...msgs].reverse().find((m) => m.role === "user")?.text ?? ""; }
function Index() {
  const getQloo = useServerFn(getQlooRecommendations);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("qloo");
  const [voiceOn, setVoiceOn] = useState(true);
  const [about, setAbout] = useState(false);
  const [menu, setMenu] = useState(false);
  const [budget, setBudget] = useState("");
  const [pace, setPace] = useState("");
  const [trip, setTrip] = useState<"moving" | "visiting">("moving");
  const [lifeStage, setLifeStage] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [climate, setClimate] = useState("");
  const [city, setCity] = useState<CityResolution | null>(null);
  const [snapNotice, setSnapNotice] = useState<string | null>(null);
  const tts = useSpeechSynthesis();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const requestRef = useRef(0);
  const resetPending = useRef(false);
  const voiceEnabledRef = useRef(voiceOn);
  voiceEnabledRef.current = voiceOn;
  const started = msgs.length > 0;
  // Core search: runs the current taste text against a given city and mode.
  const search = async (t: string, c: CityResolution, m: Mode) => {
    const request = ++requestRef.current;
    setInput("");
    setBusy(true);
    const aid = ++idRef.current;
    setMsgs((prev) => [
      ...prev,
      { id: ++idRef.current, role: "user", text: t },
      { id: aid, role: "assistant", steps: [] },
    ]);
    try {
    const result = m === "qloo" ? await getQloo({ data: { message: t, city: c.city.name, prefs: {
      budget: (budget || undefined) as Prefs["budget"], pace: (pace || undefined) as Prefs["pace"], trip,
      lifeStage: (lifeStage || undefined) as Prefs["lifeStage"], chips: chips as Prefs["chips"], climate: (climate || undefined) as Prefs["climate"],
    } } }) : await runAgent(
      t,
      m,
      (s) => {
        if (request === requestRef.current)
          setMsgs((prev) =>
            prev.map((x) =>
              x.id === aid && x.role === "assistant" ? { ...x, steps: [...x.steps, s] } : x,
            ),
          );
      },
      c.city.name,
    );
    if (request !== requestRef.current) return;
    setMsgs((prev) => prev.map((x) => (x.id === aid ? { ...x, result } : x)));
    setBusy(false);
    if (voiceEnabledRef.current) tts.speak(result.spoken);
    inputRef.current?.focus({ preventScroll: true });
    } catch {
      if (request !== requestRef.current) return;
      setMsgs((prev) => prev.map((x) => x.id === aid ? { ...x, error: "Could not load recommendations. Please try again." } : x));
      setBusy(false);
    }
  };
  const send = async (text: string) => {
    const t = text.trim() || chips.join(", ");
    if (!city) {
      if (t) setInput(t);
      focusDestination();
      return;
    }
    if (!t || busy || resetPending.current) return;
    await search(t, city, mode);
  };
  // Re-run the current search against a new city and/or mode (header picker, similar cities, mode toggle).
  const rerun = (c: CityResolution, m: Mode) => {
    const t = tasteMessage(msgs) || chips.join(", ");
    ++requestRef.current;
    setMsgs([]);
    setCity(c);
    setSnapNotice(null);
    setBusy(false);
    tts.cancel();
    if (t) void search(t, c, m);
  };
  const stt = useSpeechRecognition(send);
  const handleCity = (r: CityResolution) => {
    if (started && r.city.name !== city?.city.name) rerun(r, mode);
    else {
      setCity(r);
      setSnapNotice(null);
    }
  };
  const focusDestination = () => {
    document.getElementById("pick-city")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("destination-city")?.focus({ preventScroll: true });
  };
  const changeCity = () => {
    ++requestRef.current;
    resetPending.current = true;
    tts.cancel();
    if (stt.listening) stt.stop();
    setMsgs([]);
    setCity(null);
    setSnapNotice(null);
    setInput("");
    setBusy(false);
    window.setTimeout(() => {
      focusDestination();
      resetPending.current = false;
    }, 100);
  };
  const jump = (id: string) => {
    setMenu(false);
    if (started) {
      changeCity();
      window.setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        160,
      );
    } else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const typeInstead = () => {
    document.getElementById("pick-city")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("tastes-input")?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (started) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, started]);
  useEffect(() => {
    if (!about) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbout(false);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [about]);
  const data = mode === "llm" && city ? CITY_DATA[city.city.name] : undefined;
  const preview =
    data?.neighborhoods
      .slice(0, 4)
      .map((n, i) => ({ ...n, score: 94 - i * 2, matched: [], rentRange: data.rent[n.rent] })) ??
    [];
  const previewPlan = data
    ? [
        {
          week: "Week 1",
          items: [`Explore ${preview[0]?.name ?? city?.city.name} on foot`, data.transit],
        },
        {
          week: "Week 2",
          items: ["Find your favorite neighborhood café", "Meet someone who shares your tastes"],
        },
        { week: "Week 3", items: [data.bank, "Make a weekend feel like your own"] },
        { week: "Week 4", items: ["Settle into your new routine", data.local] },
      ]
    : [];
  const mic = (large = false) =>
    stt.supported ? (
      <Button
        type="button"
        variant="icon"
        aria-label={stt.listening ? "Stop listening" : "Start speaking"}
        onClick={stt.listening ? stt.stop : stt.start}
        disabled={busy}
        className={`bg-primary text-primary-foreground ${large ? "h-14 w-14" : ""} ${stt.listening ? "listening" : ""}`}
      >
        {stt.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
    ) : null;
  const modeControl = (
    <div className="flex items-center rounded-full border p-1" aria-label="Answer mode">
      {(["qloo", "llm"] as Mode[]).map((m) => (
        <Button
          key={m}
          variant="plain"
          aria-pressed={mode === m}
          onClick={() => {
            if (m === mode) return;
            setMode(m);
            if (started && city) rerun(city, m);
          }}
          className={`rounded-full px-3 py-2 text-[10px] ${mode === m ? "bg-card" : "text-muted-foreground"}`}
        >
          {m === "qloo" ? "Qloo-grounded" : "Without Qloo"}
        </Button>
      ))}
    </div>
  );
  return (
    <div className="shell">
      <header className="navbar">
        <nav className="hidden items-center gap-4 text-[11px] md:flex" aria-label="Main navigation">
          <Button variant="plain" onClick={() => jump("how-it-works")}>
            How it works
          </Button>
          <span className="text-muted-foreground">·</span>
          <Button variant="plain" onClick={() => jump("pick-city")}>
            Cities
          </Button>
          <span className="text-muted-foreground">·</span>
          <Button variant="plain" onClick={() => setAbout(true)}>
            About
          </Button>
        </nav>
        <div className="md:hidden" />
        <Button
          variant="plain"
          onClick={() => {
            if (started) changeCity();
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Soft Landing home"
          className="wordmark"
        >
          <span>Soft</span>
          <small>LANDING</small>
        </Button>
        <div className="relative flex items-center justify-end gap-4">
          <div className="hidden max-w-44 lg:block">
            <CityPicker compact value={city} onResolve={handleCity} />
          </div>
          <Button
            variant="icon"
            aria-label="Open menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {menu && (
            <nav
              className="absolute right-0 top-14 z-50 flex w-64 flex-col gap-4 rounded-2xl border bg-card p-6 text-sm"
              aria-label="Menu"
            >
              <Button variant="plain" onClick={() => jump("how-it-works")}>
                How it works
              </Button>
              <Button variant="plain" onClick={() => jump("pick-city")}>
                Cities
              </Button>
              <Button
                variant="plain"
                onClick={() => {
                  setMenu(false);
                  setAbout(true);
                }}
              >
                About
              </Button>
              {modeControl}
              <Button
                variant="plain"
                onClick={() => {
                  setVoiceOn(!voiceOn);
                  tts.cancel();
                }}
                className="flex items-center gap-2"
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}Voice
                replies {voiceOn ? "on" : "off"}
              </Button>
            </nav>
          )}
        </div>
      </header>
      <main>
        {!started ? (
          <>
            <section className="hero animate-rise">
              <p className="eyebrow text-muted-foreground">Taste-matched relocation</p>
              <h1>
                Move anywhere,
                <br className="md:hidden" /> <em>feel at home.</em>
              </h1>
              <p className="hero-subtitle">The calm side of a new city.</p>
              <p className="mt-5 text-xs text-muted-foreground">
                  {city ? <><span className="emoji">{flagForCountry(city.city.country)}</span> {city.city.name} · Your next chapter</> : "Your next chapter, anywhere"}
              </p>
              {city && <Button onClick={changeCity} className="mt-4 py-2 text-xs"><Globe2 className="h-3 w-3"/>Change city</Button>}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-6">
                {stt.supported && (
                  <Button
                    onClick={stt.listening ? stt.stop : stt.start}
                    className={stt.listening ? "listening" : ""}
                  >
                    {stt.listening ? "Listening…" : "Talk to Soft Landing"}
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" onClick={typeInstead}>
                  Type instead <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              {stt.listening && (
                <p className="mt-5 text-sm" aria-live="polite">
                  {stt.transcript || "Listening…"}
                </p>
              )}
              {stt.supported === false && (
                <p className="mt-4 text-xs text-muted-foreground">Voice works best in Chrome</p>
              )}
              <div className="hero-strip">
                {HERO_PHOTOS.map((p) => (
                  <figure key={p.src}>
                    <img src={p.src} alt={p.label} />
                  </figure>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span>A new city. A familiar feeling.</span>
                <span>—</span>
                <span>Powered by Qloo Taste AI</span>
              </div>
            </section>
            <section id="pick-city" className="city-panel section-space">
              <img
                className="panel-photo"
                src={city ? cityPhoto(city.city.name) : DEFAULT_PANEL_PHOTO}
                alt={city ? `${city.city.name} skyline` : "A new city awaits"}
              />
              <div>
                <p className="eyebrow mb-5 text-photo-foreground">Somewhere that feels like you</p>
                <h2>
                  Pick your city.
                  <br />
                  <i>We'll find your people.</i>
                </h2>
              </div>
              <div>
                <form
                  className="destination-bar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                >
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="destination-city">
                      Destination
                    </label>
                    <CityPicker id="destination-city" value={city} onResolve={handleCity} />
                  </div>
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="tastes-input">
                      What you love
                    </label>
                    <input
                      id="tastes-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Coffee, music, quiet mornings…"
                    />
                  </div>
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="budget">
                      Monthly budget
                    </label>
                    <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                      <option value="">Monthly budget</option>
                      <option value="low">Low</option>
                      <option value="mid">Mid</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="pace">
                      Lifestyle pace
                    </label>
                    <select id="pace" value={pace} onChange={(e) => setPace(e.target.value)}>
                      <option value="">Lifestyle pace</option>
                      <option value="quiet">Quiet</option>
                      <option value="balanced">Balanced</option>
                      <option value="energetic">Energetic</option>
                    </select>
                  </div>
                  {input.trim() || chips.length ? (
                    <Button
                      variant="icon"
                      type="submit"
                      aria-label="Find my neighborhoods"
                      className="bg-primary text-primary-foreground"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  ) : (
                    mic(true)
                  )}
                </form>
                <div className="preference-bar">
                  <div className="preference-toggle" role="group" aria-label="Moving or visiting">
                    {(["moving", "visiting"] as const).map((v) => (
                      <button key={v} type="button" aria-pressed={trip === v} onClick={() => setTrip(v)} className="preference-chip">
                        {v === "moving" ? "Moving" : "Visiting"}
                      </button>
                    ))}
                  </div>
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="life-stage">Life stage</label>
                    <select id="life-stage" value={lifeStage} onChange={(e) => setLifeStage(e.target.value)}>
                      <option value="">Life stage</option>
                      <option value="student">Student</option>
                      <option value="young-professional">Young professional</option>
                      <option value="family">Family</option>
                      <option value="retiree">Retiree</option>
                    </select>
                  </div>
                  <div className="destination-field">
                    <label className="eyebrow" htmlFor="climate">Climate preference</label>
                    <select id="climate" value={climate} onChange={(e) => setClimate(e.target.value)}>
                      <option value="">Climate</option>
                      <option value="warm">Warm</option>
                      <option value="mild">Mild</option>
                      <option value="cool">Cool</option>
                    </select>
                  </div>
                  <div className="preference-chips" role="group" aria-label="Your tastes">
                    {TASTE_CHIPS.map((c) => (
                      <button key={c} type="button" aria-pressed={chips.includes(c)} className="preference-chip"
                        onClick={() => setChips((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {snapNotice && (
                  <p className="mt-3 rounded-xl bg-card p-3 text-xs" role="status">
                    {snapNotice}
                  </p>
                )}
              </div>
            </section>
            {!city && (
              <section id="how-it-works" className="section-space text-center" role="status">
                <Globe2 className="mx-auto mb-5 h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <h2 className="section-title">Pick a city to see your matches</h2>
                <Button onClick={focusDestination} className="mt-6 text-xs">
                  Pick a city <ArrowRight className="h-4 w-4" />
                </Button>
              </section>
            )}
            {city && preview.length > 0 && <section id="how-it-works" className="section-space">
              <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
                <h2 className="section-title">
                  Neighborhoods that <i>get you.</i>
                </h2>
                <p className="eyebrow pb-2 text-muted-foreground">Matched by Qloo</p>
              </div>
              <div className={`grid gap-8 sm:grid-cols-2 ${preview.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
                {preview.map((n, i) => (
                  <NeighborhoodCard key={n.name} n={n} city={city.city.name} index={i} />
                ))}
              </div>
            </section>}
            {city && previewPlan.length > 0 && <div className="section-space">
              <Timeline plan={previewPlan} city={city.city.name} />
            </div>}
            <section className="section-space text-center">
              <p className="eyebrow text-muted-foreground">Start with what you love</p>
              <h2 className="section-title mt-4">
                Tell us your <i>kind of city.</i>
              </h2>
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {EXAMPLES.map((e) => (
                  <Button
                    variant="plain"
                    key={e}
                    onClick={() => send(e)}
                    className="rounded-2xl border p-6 text-left text-xs leading-relaxed"
                  >
                    “{e}”<ArrowUpRight className="mt-5 h-4 w-4" />
                  </Button>
                ))}
              </div>
            </section>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              {modeControl}
              <Button
                variant="icon"
                aria-label="Toggle voice replies"
                aria-pressed={voiceOn}
                onClick={() => {
                  setVoiceOn(!voiceOn);
                  tts.cancel();
                }}
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <section className="chat-shell">
            <div className="sticky top-0 z-30 mb-10 flex flex-wrap items-center justify-between gap-3 border-b bg-background py-3">
              <Button onClick={changeCity} className="px-4 py-3 text-xs">
                <Globe2 className="h-4 w-4" />
                Change city
              </Button>
              <div className="flex items-center gap-2">
                {modeControl}
                <Button
                  variant="icon"
                  aria-label="Toggle voice replies"
                  aria-pressed={voiceOn}
                  onClick={() => {
                    setVoiceOn(!voiceOn);
                    tts.cancel();
                  }}
                >
                  {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="eyebrow mb-7 text-muted-foreground">
              <span className="emoji">{city ? flagForCountry(city.city.country) : ''}</span> Your soft landing
              in {city?.city.name}
            </p>
            {snapNotice && <p className="mb-7 rounded-xl border p-4 text-xs">{snapNotice}</p>}
            <div className="space-y-12">
              {msgs.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[90%] rounded-3xl rounded-br-md bg-card px-6 py-4 text-sm leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id}>
                    {m.result ? (
                      <AnswerCard r={m.result} onChooseCity={(name) => {
                        const resolved = resolveCity(name);
                        if (resolved) rerun(resolved, mode);
                      }} />
                    ) : m.error ? <p role="alert">{m.error}</p> : (
                      <div className="rounded-2xl border p-6">
                        <p className="eyebrow mb-5 text-muted-foreground">
                          Finding your soft landing
                        </p>
                        <Collapsible title="Agent steps"><StepList steps={m.steps} pending /></Collapsible>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
            <div ref={endRef} />
            <div className="chat-composer">
              {tts.speaking && (
                <div className="mb-3 text-center">
                  <Button onClick={tts.cancel} className="py-2 text-xs">
                    <Square className="h-3 w-3" />
                    Stop speaking
                  </Button>
                </div>
              )}
              {stt.listening && (
                <p className="mb-3 text-center text-xs" aria-live="polite">
                  {stt.transcript || "Listening…"}
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-full border bg-card p-2 pl-6"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your tastes…"
                  aria-label="Chat message"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
                {mic()}
                <Button
                  variant="icon"
                  type="submit"
                  aria-label="Send"
                  disabled={busy || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              {stt.supported === false && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Voice works best in Chrome
                </p>
              )}
            </div>
          </section>
        )}
      </main>
      <footer className="section-space flex flex-wrap items-center justify-between gap-5 border-t py-9">
        <span className="font-display text-3xl">Soft Landing</span>
        <div className="flex items-center gap-6 text-[10px] text-muted-foreground">
          <span>Powered by Qloo Taste AI</span>
          <Button variant="plain" onClick={() => setAbout(true)}>
            About
          </Button>
        </div>
      </footer>
      {about && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-photo-shade/40 p-5"
          onClick={() => setAbout(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            className="relative max-w-lg rounded-3xl bg-background p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="icon"
              autoFocus
              aria-label="Close About"
              onClick={() => setAbout(false)}
              className="absolute right-3 top-3"
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="eyebrow text-muted-foreground">A little about us</p>
            <h2 id="about-title" className="mt-5 text-4xl">
              A softer <i>new beginning.</i>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Soft Landing helps people moving to a new city find neighborhoods, food spots and
              scenes that match their personal taste. Pick a destination, speak or type what you
              love, and explore a taste-matched first-30-days plan with every agent step shown. Qloo-grounded answers use live city insights, with clearly labeled same-city samples only when Qloo fails.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
