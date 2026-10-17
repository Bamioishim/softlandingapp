import type { AgentResult, AgentStep, NeighborhoodMatch, Place } from "./agent-types";
import { resolveCity, CITIES } from "./cities";
import { runSampleAgent } from "./sample-agent";
import { z } from "zod";

export const agentInput = z.object({ city: z.string().trim().min(1).max(120), message: z.string().trim().min(1).max(2000) });
const tagSchema = z.object({ name: z.string(), id: z.string().optional() });
const entitySchema = z.object({
  name: z.string(), location: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.array(tagSchema).optional(), query: z.object({ affinity: z.number().optional() }).passthrough().optional(),
  properties: z.object({ neighborhood: z.string().nullable().optional(),
    locality: z.object({ neighborhood: z.object({ name: z.string() }).nullable().optional() }).passthrough().optional(),
    description: z.string().nullable().optional(), is_closed: z.boolean().nullable().optional(),
    primary_genre: z.object({ name: z.string() }).nullable().optional(), price_level: z.number().nullable().optional(),
  }).passthrough().optional(),
}).passthrough();
const cellSchema = z.object({ location: z.object({ latitude: z.number(), longitude: z.number() }), query: z.object({ affinity: z.number().optional() }).passthrough() });
const responseSchema = z.object({ success: z.boolean().optional(), results: z.object({ tags: z.array(tagSchema).optional(), entities: z.array(entitySchema).optional(), heatmap: z.array(cellSchema).optional() }) });

// Editorial comparison profiles: these are alternatives to try, never claimed Qloo coverage.
const GROUPS = [
  { names: ["Paris", "Lyon", "Bordeaux", "Montreal", "Brussels"], reason: "French-speaking culture, café life and a temperate urban lifestyle" },
  { names: ["London", "Manchester", "Dublin", "Amsterdam"], reason: "Northern European climate, international culture and a lively music scene" },
  { names: ["Berlin", "Prague", "Warsaw", "Budapest"], reason: "Central European climate, creative nightlife and comparatively moderate costs" },
  { names: ["Madrid", "Barcelona", "Lisbon", "Rome", "Athens"], reason: "Warm southern European climate, food-led culture and outdoor social life" },
  { names: ["Lagos", "Accra", "Abidjan"], reason: "West African culture, tropical climate and energetic music and food scenes" },
  { names: ["Tokyo", "Osaka", "Kyoto", "Seoul"], reason: "East Asian urban culture, seasonal climate and excellent city transit" },
  { names: ["Bangkok", "Kuala Lumpur", "Jakarta", "Singapore"], reason: "Tropical Southeast Asian climate, diverse food culture and regional connections" },
  { names: ["New York City", "Chicago", "Boston", "Toronto"], reason: "Multicultural North American city life, seasonal weather and major arts scenes" },
  { names: ["Los Angeles", "San Francisco", "San Diego"], reason: "West Coast creative culture, mild climate and higher urban living costs" },
  { names: ["Dubai", "Abu Dhabi", "Doha", "Riyadh"], reason: "Gulf culture, hot desert climate and international urban life" },
  { names: ["Sydney", "Melbourne", "Brisbane", "Auckland"], reason: "Australasian culture, outdoor living and similar higher-cost housing markets" },
  { names: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad"], reason: "Indian urban culture, regional food and comparable everyday cost patterns" },
  { names: ["Mexico City", "Bogotá", "Lima", "Buenos Aires"], reason: "Latin American city culture, food and arts with moderate everyday costs" },
  { names: ["Stockholm", "Copenhagen", "Oslo", "Helsinki"], reason: "Nordic culture, cooler climate and similar higher living costs" },
  { names: ["Cape Town", "Johannesburg", "Durban"], reason: "South African culture, shared currency and regional cost patterns" },
];
export function similarCities(city: string) {
  const selected = resolveCity(city)?.city;
  const group = GROUPS.find((g) => g.names.includes(city)) ?? GROUPS.find((g) => g.names.some((name) => resolveCity(name)?.city.country === selected?.country));
  if (group) return group.names.filter((n) => n !== city && resolveCity(n)).slice(0, 3).map((name) => ({ name, reason: group.reason }));
  return CITIES.filter((c) => c.country === selected?.country && c.name !== city).slice(0, 3).map((c) => ({ name: c.name, reason: "Same country, shared culture and currency; compare local costs and climate" }));
}
function blank(city: string, status: "unavailable" | "error", steps: AgentStep[]): AgentResult {
  const summary = status === "unavailable" ? `${city} isn't available yet` : `Qloo couldn't load ${city} right now. Please try again.`;
  return { city, mode: "qloo", source: "qloo", status, summary, spoken: summary, steps, neighborhoods: [], places: [], plan: [], alternatives: status === "unavailable" ? similarCities(city) : [] };
}
class LocalityError extends Error {}
export async function queryQloo(input: z.infer<typeof agentInput>, key: string | undefined, fetcher: typeof fetch = fetch): Promise<AgentResult> {
  const { city, message } = agentInput.parse(input);
  if (!resolveCity(city)) throw new Error("Choose a recognized city before finding matches");
  const steps: AgentStep[] = [];
  const call = async (label: string, path: string, params: Record<string, string>, timeoutMs = 60000) => {
    const start = performance.now();
    try {
      if (!key) throw new Error("Qloo unavailable");
      const url = new URL(path, "https://hackathon.api.qloo.com");
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      const response = await fetcher(url, { headers: { "X-Api-Key": key }, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        if (response.status === 400 && /locality/i.test(body)) throw new LocalityError("Qloo cannot resolve this locality");
        throw new Error("Qloo request failed");
      }
      const payload = responseSchema.parse(await response.json());
      if (payload.success === false) throw new Error("Qloo request failed");
      steps.push({ label, ms: performance.now() - start });
      return payload.results;
    } catch (e) {
      steps.push({ label: `${label} — failed`, ms: performance.now() - start });
      throw e instanceof LocalityError ? e : new Error("Qloo request failed");
    }
  };
  try {
    const terms = [...new Set(message.toLowerCase().replace(/[^\p{L}\p{N}\s,-]/gu, " ").split(/,|\band\b|\bwith\b/).map((s) => s.replace(/^(i love|i like|i'm into|i am into|i enjoy)\s+/, "").trim()).filter(Boolean))].slice(0, 3);
    const tags = (await Promise.all(terms.map((term) => call(`Qloo taste lookup: ${term}`, "/v2/tags", { "filter.query": term, take: "3" })))).flatMap((r) => r.tags ?? []).map((t) => t.id).filter((id): id is string => Boolean(id));
    const signals: Record<string, string> = tags.length ? { "signal.interests.tags": [...new Set(tags)].join(",") } : {};
    // Both calls retain the exact selected city; a successful empty response is not an error.
    // The heatmap endpoint requires at least one taste signal, so skip it when no tags matched.
    const results = await Promise.allSettled([
      tags.length
        ? call(`Qloo ${city} neighborhood heatmap`, "/v2/insights", { "filter.type": "urn:heatmap", "filter.location.query": city, ...signals })
        : Promise.resolve({ heatmap: [] }),
      // Place insights hang with taste tags, so call tag-free with a tight timeout and rank by taste in code below.
      call(`Qloo ${city} place insights`, "/v2/insights", { "filter.type": "urn:entity:place", "filter.location.query": city, take: "30" }, 8000),
    ]);
    const heat = results[0]; const entities = results[1];
    if (heat.status === "rejected") throw heat.reason;
    if (entities.status === "rejected") throw entities.reason;
    const cells = heat.value.heatmap ?? [];
    // Rank places by taste in code: count how many of the user's terms appear in each place's name or tags.
    const termScore = (p: z.infer<typeof entitySchema>) => {
      const haystack = [p.name, ...(p.tags ?? []).map((t) => t.name)].join(" ").toLowerCase();
      return terms.reduce((acc, term) => acc + (term.split(/\s+/).some((w) => w.length > 2 && haystack.includes(w)) ? 1 : 0), 0);
    };
    const rows = (entities.value.entities ?? []).filter((p) => p.properties?.is_closed !== true).sort((a, b) => termScore(b) - termScore(a));
    if (!rows.length && !cells.length) return blank(city, "unavailable", steps);
    const neighborhoodName = (p: z.infer<typeof entitySchema>) => p.properties?.locality?.neighborhood?.name ?? p.properties?.neighborhood;
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
      const score = typeof affinity === "number" ? Math.round(Math.max(0, Math.min(1, affinity)) * 100) : 0;
      const current = neighborhoods.get(name);
      if (!current || score > current.score) neighborhoods.set(name, { name, borough: city, rent: "$$", rentRange: "Not provided by Qloo", tags, matched: [], score, scoreAvailable: typeof affinity === "number", why: `Qloo recommends ${p.name} here${cells.length ? "; score estimated from the nearest taste heatmap cell" : " based on your taste signals"}.` });
    }
    const top = [...neighborhoods.values()].sort((a, b) => b.score - a.score).slice(0, 3);
    const plan = [
      { week: "Week 1", items: [`Sort your residence ID or permit in ${city}`, "Open a local bank account", "Get a local SIM card", `Pick up a ${city} transport card`] },
      { week: "Week 2", items: ["Compare local apartment listings", `Try ${places[1]?.name ?? "a new local spot"}`, "Join a local community group"] },
      { week: "Week 3", items: [`Spend a weekend in ${top[1]?.name ?? city}`, "Check local banking and registration requirements"] },
      { week: "Week 4", items: ["Review your housing options", "Build a weekly routine around your favorite places"] },
    ];
    const summary = top.length ? `Qloo's place insights point to ${top.map((n) => n.name).join(", ")} in ${city}. ${cells.length ? "Neighborhood scores estimate taste affinity at nearby heatmap cells, not housing suitability." : "Qloo returned no heatmap scores; these neighborhoods come from recommended places."}` : `Qloo found ${rows.length} places in ${city}${cells.length ? " and taste heatmap results" : ""}, but no verified neighborhood labels.`;
    return { city, mode: "qloo", source: "qloo", status: "ok", summary, spoken: summary, steps, neighborhoods: top, places, plan };
  } catch (e) {
    // A 400 "unable to resolve to a valid locality" means Qloo has no coverage here: show the unavailable blank, not an error.
    if (e instanceof LocalityError) return blank(city, "unavailable", steps);
    try {
      const sample = await runSampleAgent(message, "qloo", undefined, city);
      return { ...sample, steps, summary: `Qloo couldn't load ${city} right now. Showing same-city sample recommendations, not live Qloo results. ${sample.summary}` };
    } catch { return blank(city, "error", steps); }
  }
}