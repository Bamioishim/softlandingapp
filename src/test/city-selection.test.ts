import { afterEach, describe, expect, it, vi } from "vitest";
import { runAgent } from "@/lib/agent";
import { resolveCity } from "@/lib/cities";

afterEach(() => vi.useRealTimers());

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

  it("does not substitute New York for an unsupported dataset", async () => {
    await expect(runAgent("coffee", "qloo", undefined, "not-a-real-city-xyz")).rejects.toThrow("supported city");
  });

  it("uses the selected city's neighborhoods and plan", async () => {
    vi.useFakeTimers();
    const pending = runAgent("coffee", "qloo", undefined, "London");
    await vi.runAllTimersAsync();
    const result = await pending;
    expect(result.city).toBe("London");
    expect(result.neighborhoods.map((n) => n.name).sort()).toEqual(["Hackney", "Hampstead", "Peckham"]);
    expect(result.plan[0]?.items).toContain("Set up contactless or an Oyster card for the Tube");
  });
});