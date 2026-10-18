import { describe, expect, it } from "vitest";
import { queryQloo, similarCities } from "@/lib/qloo";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const place = { name: "Café A", location: { lat: 48.85, lon: 2.35 }, tags: [{ name: "Coffee" }], properties: { locality: { neighborhood: { name: "Le Marais" } } } };

function fakeFetch(handler: (url: string) => Response) {
  const urls: string[] = [];
  const fetcher = (async (input: RequestInfo | URL) => { const url = String(input); urls.push(url); return handler(url); }) as typeof fetch;
  return { fetcher, urls };
}

describe("queryQloo", () => {
  it("sends place insights with exactly filter.type, filter.location.query and take=20", async () => {
    const { fetcher, urls } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ success: true, results: { entities: [place] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    expect(urls).toContain("https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:place&filter.location.query=Paris&take=20");
    expect(r.status).toBe("ok");
    expect(r.neighborhoods.map((n) => n.name)).toEqual(["Le Marais"]);
  });

  it("skips the heatmap when no taste tags matched", async () => {
    const { fetcher, urls } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [place] } })));
    await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    expect(urls.some((u) => u.includes("urn:heatmap"))).toBe(false);
  });

  it("shows the real HTTP status and body in agent steps when place insights fail", async () => {
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : new Response("rate limited", { status: 429 })));
    const r = await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    expect(r.steps.some((s) => s.label.includes("HTTP 429 rate limited"))).toBe(true);
  });

  it("offers 2-3 similar cities when a city isn't available", async () => {
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [] } })));
    const r = await queryQloo({ city: "Lyon", message: "coffee" }, "k", fetcher);
    expect(r.status).toBe("unavailable");
    expect(r.alternatives!.length).toBeGreaterThanOrEqual(2);
    expect(r.alternatives!.length).toBeLessThanOrEqual(3);
  });
});

describe("preferences", () => {
  it("never sends budget or pace to Qloo; taste chips become interests", async () => {
    const { fetcher, urls } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [place] } })));
    await queryQloo({ city: "Paris", message: "", prefs: { budget: "low", pace: "quiet", chips: ["Art"] } }, "k", fetcher);
    expect(urls.some((u) => /low|quiet|budget|pace/i.test(u))).toBe(false);
    expect(urls.some((u) => u.includes("/v2/tags?filter.query=art"))).toBe(true);
  });

  it("gives each neighborhood card a different Qloo place photo, or none", async () => {
    const p = (name: string, nb: string, url?: string) => ({ ...place, name, properties: { locality: { neighborhood: { name: nb } }, ...(url ? { image: { url } } : {}) } });
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [p("A", "N1", "https://x/1.jpg"), p("B", "N2", "https://x/1.jpg"), p("C", "N3")] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    const imgs = r.neighborhoods.map((n) => n.image).filter(Boolean);
    expect(new Set(imgs).size).toBe(imgs.length);
    expect(r.neighborhoods.find((n) => n.name === "N3")?.image).toBeUndefined();
  });

  it("Visiting turns the plan into a day-by-day trip", async () => {
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [place] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee", prefs: { trip: "visiting" } }, "k", fetcher);
    expect(r.plan[0]?.week).toBe("Day 1");
  });
});

describe("result quality rules", () => {
  it("caps match scores at 99%, never 100%", async () => {
    const hot = { ...place, query: { affinity: 1 } };
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [hot] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    expect(r.neighborhoods.every((n) => n.score <= 99)).toBe(true);
  });

  it("strips size params from image URLs and prefers images 800px wide or more", async () => {
    const p = (name: string, url: string) => ({ ...place, name, properties: { ...place.properties, image: { url } } });
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [p("Small", "https://x/a.jpg?w=200&h=200"), p("Big", "https://x/b.jpg?w=1200&fit=crop")] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee" }, "k", fetcher);
    expect(r.neighborhoods[0]?.image).toBe("https://x/b.jpg");
  });

  it("marks Visiting results so the plan heading can switch", async () => {
    const { fetcher } = fakeFetch((u) => (u.includes("/v2/tags") ? json({ results: { tags: [] } }) : json({ results: { entities: [place] } })));
    const r = await queryQloo({ city: "Paris", message: "coffee", prefs: { trip: "visiting" } }, "k", fetcher);
    expect(r.trip).toBe("visiting");
  });
});

describe("similarCities", () => {
  it("suggests Lagos, Abuja, Accra for Ilorin", () => {
    expect(similarCities("Ilorin").map((c) => c.name)).toEqual(["Lagos", "Abuja", "Accra"]);
  });
});
