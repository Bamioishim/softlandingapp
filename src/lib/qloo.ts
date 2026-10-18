import type { AgentResult, AgentStep, NeighborhoodMatch, Place } from "./agent-types";
import { resolveCity } from "./cities";
import { runSampleAgent } from "./sample-agent";
import { similarCities, type Climate } from "./similar-cities";
import { z } from "zod";

export const TASTE_CHIPS = ["Food", "Music", "Art", "Nightlife", "Outdoors", "Fashion", "Books", "Film"] as const;
export const prefsSchema = z.object({
  budget: z.enum(["low", "mid", "high"]).optional(),
  pace: z.enum(["quiet", "balanced", "energetic"]).optional(),
  trip: z.enum(["moving", "visiting"]).optional(),
  lifeStage: z.enum(["student", "young-professional", "family", "retiree"]).optional(),
  chips: z.array(z.enum(TASTE_CHIPS)).max(8).optional(),
  climate: z.enum(["warm", "mild", "cool"]).optional(),
});
export type Prefs = z.infer<typeof prefsSchema>;
export const agentInput = z.object({ city: z.string().trim().min(1).max(120), message: z.string().trim().max(2000), prefs: prefsSchema.optional() })
  .refine((v) => v.message.length > 0 || (v.prefs?.chips?.length ?? 0) > 0, "Tell us what you love");
const tagSchema = z.object({ name: z.string(), id: z.string().optional() });
const entitySchema = z.object({
  name: z.string(), location: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.array(tagSchema).optional(), query: z.object({ affinity: z.number().optional() }).passthrough().optional(),
  properties: z.object({ neighborhood: z.string().nullable().optional(),
    locality: z.object({ neighborhood: z.object({ name: z.string() }).nullable().optional() }).passthrough().optional(),
    description: z.string().nullable().optional(), is_closed: z.boolean().nullable().optional(),
    primary_genre: z.object({ name: z.string() }).nullable().optional(), price_level: z.number().nullable().optional(),
    image: z.object({ url: z.string().url() }).nullable().optional().catch(null),
  }).passthrough().optional(),
}).passthrough();
type Entity = z.infer<typeof entitySchema>;
const cellSchema = z.object({ location: z.object({ latitude: z.number(), longitude: z.number() }), query: z.object({ affinity: z.number().optional() }).passthrough() });
// Lenient list: one malformed provider row is dropped instead of failing the whole response.
const lenient = <T extends z.ZodTypeAny>(item: T) => z.array(z.unknown()).transform((rows) => rows.flatMap((row) => { const r = item.safeParse(row); return r.success ? [r.data as z.infer<T>] : []; })).optional();
const responseSchema = z.object({ success: z.boolean().optional(), results: z.object({ tags: lenient(tagSchema), entities: lenient(entitySchema), heatmap: lenient(cellSchema) }).passthrough() });

export { similarCities };
// Qloo image URLs often carry downscaling params; strip them to request the original size.
const originalImage = (url: string) => {
  try {
    const u = new URL(url);
    for (const k of ["w", "width", "h", "height", "size", "fit", "q", "quality", "dpr"]) u.searchParams.delete(k);
    return u.toString();
  } catch {
    return url;
  }
};
const imageWidth = (url: string) => {
  const m = url.match(/[?&](?:w|width)=(\d+)/i);
  return m ? Number(m[1]) : 0;
};
function blank(city: string, status: "unavailable" | "error", steps: AgentStep[], climate?: Climate): AgentResult {
  const summary = status === "unavailable" ? `${city} isn't available yet` : `Qloo couldn't load ${city} right now. Please try again.`;
  return { city, mode: "qloo", source: "qloo", status, summary, spoken: summary, steps, neighborhoods: [], places: [], plan: [], alternatives: status === "unavailable" ? similarCities(city, climate) : [] };
}
const STAGE_ITEMS: Record<NonNullable<Prefs["lifeStage"]>, string> = {
  student: "Register with your university and get a student transport discount",
  "young-professional": "Find a coworking space or professional meetup",
  family: "Shortlist schools and family doctors near your top neighborhood",
  retiree: "Register with a local clinic and find a community club",
};
export function buildPlan(city: string, prefs: Prefs, places: Place[], top: NeighborhoodMatch[]): AgentResult["plan"] {
  if (prefs.trip === "visiting") {
    const spot = (i: number) => places[i]?.name ?? "a local favorite";
    return [
      { week: "Day 1", items: [`Arrive and settle in around ${top[0]?.name ?? city}`, `Visit ${spot(0)}`, `Dinner near ${spot(1)}`] },
      { week: "Day 2", items: [`Explore ${top[1]?.name ?? city}`, `Stop by ${spot(2)}`, `Evening at ${spot(3)}`] },
      { week: "Day 3", items: [`Morning in ${top[2]?.name ?? city}`, `See ${spot(4)}`, `Last stop: ${spot(5)}`] },
    ];
  }
  const w1 = [`Sort your residence ID or permit in ${city}`, "Open a local bank account", "Get a local SIM card", `Pick up a ${city} transport card`];
  if (prefs.lifeStage) w1.push(STAGE_ITEMS[prefs.lifeStage]);
  return [
    { week: "Week 1", items: w1 },
    { week: "Week 2", items: ["Compare local apartment listings", `Try ${places[1]?.name ?? "a new local spot"}`, "Join a local community group"] },
    { week: "Week 3", items: [`Spend a weekend in ${top[1]?.name ?? city}`, "Check local banking and registration requirements"] },
    { week: "Week 4", items: ["Review your housing options", "Build a weekly routine around your favorite places"] },
  ];
}
class LocalityError extends Error {}
export async function queryQloo(input: z.infer<typeof agentInput>, key: string | undefined, fetcher: typeof fetch = fetch): Promise<AgentResult> {
  const { city, message, prefs = {} } = agentInput.parse(input);
  if (!resolveCity(city)) throw new Error("Choose a recognized city before finding matches");
  const steps: AgentStep[] = [];
  // Query strings are built by hand so the request matches Qloo's documented form exactly (colons in URNs unescaped).
  const call = async (label: string, path: string, params: [string, string][], timeoutMs = 60000) => {
    const start = performance.now();
    const fail = (detail: string, locality = false) => {
      steps.push({ label: `${label} — failed: ${detail.replace(/\s+/g, " ").slice(0, 300)}`, ms: performance.now() - start });
      return locality ? new LocalityError(detail) : new Error(detail);
    };
    if (!key) throw fail("QLOO_API_KEY is not set");
    const url = `https://hackathon.api.qloo.com${path}?${params.map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%3A/gi, ":").replace(/%2C/gi, ",")}`).join("&")}`;
    let response: Response;
    try {
      response = await fetcher(url, { headers: { "X-Api-Key": key }, signal: AbortSignal.timeout(timeoutMs) });
    } catch (e) {
      throw fail(e instanceof Error ? `${e.name}: ${e.message}` : "network error");
    }
    const body = await response.text().catch(() => "");
    if (!response.ok) throw fail(`HTTP ${response.status} ${body || response.statusText}`, response.status === 400 && /locality/i.test(body));
    let json: unknown;
    try { json = JSON.parse(body); } catch { throw fail(`HTTP ${response.status} non-JSON body: ${body}`); }
    const parsed = responseSchema.safeParse(json);
    if (!parsed.success) throw fail(`HTTP ${response.status} unexpected response shape: ${parsed.error.issues.slice(0, 2).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    if (parsed.data.success === false) throw fail(`HTTP ${response.status} success=false: ${body}`);
    steps.push({ label, ms: performance.now() - start });
    return parsed.data.results;
  };
  try {
    const fromText = message.toLowerCase().replace(/[^\p{L}\p{N}\s,-]/gu, " ").split(/,|\band\b|\bwith\b/).map((s) => s.replace(/^(i love|i like|i'm into|i am into|i enjoy)\s+/, "").trim()).filter(Boolean);
    const terms = [...new Set([...fromText, ...(prefs.chips ?? []).map((c) => c.toLowerCase())])].slice(0, 4);
    // Run the exact place-insights request alongside taste lookups; tag failures only mean no heatmap signal.
    const placesCall = call(`Qloo ${city} place insights`, "/v2/insights", [["filter.type", "urn:entity:place"], ["filter.location.query", city], ["take", "20"]]);
    placesCall.catch(() => {});
    const tagResults = await Promise.allSettled(terms.map((term) => call(`Qloo taste lookup: ${term}`, "/v2/tags", [["filter.query", term], ["take", "3"]])));
    const tags = [...new Set(tagResults.flatMap((r) => (r.status === "fulfilled" ? r.value.tags ?? [] : [])).map((t) => t.id).filter((id): id is string => Boolean(id)))];
    // The heatmap endpoint requires a taste signal, so skip it when no tags matched; its failure never blocks places.
    const heatCall = tags.length
      ? call(`Qloo ${city} neighborhood heatmap`, "/v2/insights", [["filter.type", "urn:heatmap"], ["filter.location.query", city], ["signal.interests.tags", tags.join(",")]])
      : (steps.push({ label: "Qloo neighborhood heatmap — skipped (no taste tags matched)", ms: 0 }), Promise.resolve({ heatmap: [] }));
    const [entities, heat] = await Promise.allSettled([placesCall, heatCall]);
    if (entities.status === "rejected") throw entities.reason;
    const heatValue = heat.status === "fulfilled" ? heat.value : { heatmap: [] };
    const cells = heatValue.heatmap ?? [];
    // Rank places by taste in code: count how many of the user's terms appear in each place's name or tags.
    const termScore = (p: z.infer<typeof entitySchema>) => {
      const haystack = [p.name, ...(p.tags ?? []).map((t) => t.name)].join(" ").toLowerCase();
      return terms.reduce((acc, term) => acc + (term.split(/\s+/).some((w) => w.length > 2 && haystack.includes(w)) ? 1 : 0), 0);
    };
    // Budget and pace never reach Qloo; they only rank/filter the returned places here.
    const text = (p: Entity) => [p.name, p.properties?.primary_genre?.name ?? "", ...(p.tags ?? []).map((t) => t.name)].join(" ").toLowerCase();
    const prefScore = (p: Entity) => {
      let s = 0; const price = p.properties?.price_level; const t = text(p);
      if (prefs.budget === "low" && typeof price === "number") s += price <= 2 ? 2 : price >= 4 ? -3 : 0;
      if (prefs.budget === "high" && typeof price === "number" && price >= 3) s += 2;
      if (prefs.pace === "energetic" && /bar|club|night|music|live|pub|concert/.test(t)) s += 2;
      if (prefs.pace === "quiet") s += /caf|coffee|park|museum|library|garden|book|tea/.test(t) ? 2 : /club|night/.test(t) ? -2 : 0;
      return s;
    };
    let open = (entities.value.entities ?? []).filter((p) => p.properties?.is_closed !== true);
    if (prefs.budget === "low") { const affordable = open.filter((p) => (p.properties?.price_level ?? 0) < 4); if (affordable.length >= 3) open = affordable; }
    const rows = open.sort((a, b) => termScore(b) * 10 + prefScore(b) - (termScore(a) * 10 + prefScore(a)));
    if (!rows.length && !cells.length) return blank(city, "unavailable", steps, prefs.climate);
    const neighborhoodName = (p: Entity) => p.properties?.locality?.neighborhood?.name ?? p.properties?.neighborhood;
    const places: Place[] = rows.slice(0, 6).map((p) => ({ name: p.name, category: p.properties?.primary_genre?.name ?? "Place", neighborhood: neighborhoodName(p) ?? city, tags: (p.tags ?? []).map((t) => t.name), reason: p.properties?.description ?? `Recommended by Qloo in ${city}.` }));
    const neighborhoods = new Map<string, NeighborhoodMatch>();
    for (const p of rows) {
      const name = neighborhoodName(p);
      if (!name || name === city) continue;
      let affinity = p.query?.affinity;
      if (p.location && cells.length) {
        const location = p.location;
        const nearest = [...cells].sort((a, b) => Math.hypot(a.location.latitude - location.lat, a.location.longitude - location.lon) - Math.hypot(b.location.latitude - location.lat, b.location.longitude - location.lon))[0];
        affinity = nearest?.query.affinity ?? affinity;
      }
      const tags = (p.tags ?? []).map((t) => t.name);
      const score = typeof affinity === "number" ? Math.round(Math.max(0, Math.min(0.99, affinity)) * 100) : 0;
      const current = neighborhoods.get(name);
      if (!current || score > current.score) neighborhoods.set(name, { name, borough: city, rent: "$$", rentRange: "Not provided by Qloo", tags, matched: [], score, scoreAvailable: typeof affinity === "number", why: `Qloo recommends ${p.name} here${cells.length ? "; score estimated from the nearest taste heatmap cell" : " based on your taste signals"}.` });
    }
    const top = [...neighborhoods.values()].sort((a, b) => b.score - a.score).slice(0, 3);
    // Each card gets a distinct photo from one of its own Qloo places; none means no photo.
    // Prefer the highest-resolution image: known widths >= 800px first, then the largest known.
    const used = new Set<string>();
    for (const n of top) {
      const candidates = rows
        .filter((p) => neighborhoodName(p) === n.name && p.properties?.image?.url && !used.has(p.properties.image.url))
        .map((p) => ({ p, w: imageWidth(p.properties!.image!.url) }));
      const sharp = candidates.filter((c) => c.w >= 800);
      const pool = (sharp.length ? sharp : candidates).sort((a, b) => b.w - a.w);
      const hit = pool[0]?.p;
      if (hit?.properties?.image?.url) { used.add(hit.properties.image.url); n.image = originalImage(hit.properties.image.url); n.imageAlt = hit.name; }
    }
    const plan = buildPlan(city, prefs, places, top);
    const summary = top.length ? `Qloo's place insights point to ${top.map((n) => n.name).join(", ")} in ${city}. ${cells.length ? "Neighborhood scores estimate taste affinity at nearby heatmap cells, not housing suitability." : "Qloo returned no heatmap scores; these neighborhoods come from recommended places."}` : `Qloo found ${rows.length} places in ${city}${cells.length ? " and taste heatmap results" : ""}, but no verified neighborhood labels.`;
    return { city, mode: "qloo", source: "qloo", status: "ok", trip: prefs.trip ?? "moving", summary, spoken: summary, steps, neighborhoods: top, places, plan };
  } catch (e) {
    // A 400 "unable to resolve to a valid locality" means Qloo has no coverage here: show the unavailable blank, not an error.
    if (e instanceof LocalityError) return blank(city, "unavailable", steps, prefs.climate);
    try {
      const sample = await runSampleAgent(message || (prefs.chips ?? []).join(", "), "qloo", undefined, city);
      return { ...sample, steps, summary: `Qloo couldn't load ${city} right now. Showing same-city sample recommendations, not live Qloo results. ${sample.summary}` };
    } catch { return blank(city, "error", steps); }
  }
}