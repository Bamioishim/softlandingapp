import { describe, expect, it } from "vitest";
import { runAgent } from "@/lib/agent";
import { resolveCity } from "@/lib/cities";
import { queryQloo } from "@/lib/qloo";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fakeFetch = (handler: (url: string) => Response) =>
  ((async (input: RequestInfo | URL) => handler(String(input))) as typeof fetch);

describe("Explicit city selection", () => {
  it("does not select a destination for empty input", () => {
    expect(resolveCity("")).toBeNull();
  });

  it("leaves unrecognized destinations unselected", () => {
    expect(resolveCity("not-a-real-city-xyz")).toBeNull();
  });

  it("does not run recommendations with a default city", async () => {
    await expect(runAgent("coffee")).rejects.toThrow("Pick a city");
  });

  it("does not substitute another city for an unrecognized destination", async () => {
    const fetcher = fakeFetch(() => json({ results: { entities: [] } }));
    await expect(
      queryQloo({ city: "not-a-real-city-xyz", message: "coffee" }, "k", fetcher),
    ).rejects.toThrow("recognized city");
  });

  it("uses the selected city's neighborhoods and plan", async () => {
    const result = await runAgent("coffee", "llm", undefined, "London");
    expect(result.city).toBe("London");
    expect(result.neighborhoods.map((n) => n.name).sort()).toEqual(["Hackney", "Hampstead", "Peckham"]);
    expect(result.plan[0]?.items).toContain("Set up contactless or an Oyster card for the Tube");
  });
});
