import { describe, expect, it } from "vitest";
import { queryQloo } from "@/lib/qloo";

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
