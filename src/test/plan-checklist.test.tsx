import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Timeline } from "@/components/AnswerCard";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Plan checklist persistence", () => {
  const plan = [{ week: "Week 1", items: ["Explore on foot"] }];

  it("keeps a completed step when its city plan is reopened", async () => {
    const view = render(<Timeline plan={plan} city="London" />);
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("soft-landing:plan:London:Explore on foot") ?? "[]")).toEqual(["Week 1|Explore on foot"]));
    view.unmount();
    render(<Timeline plan={plan} city="London" />);
    await waitFor(() => expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true"));
  });

  it("does not apply another city's completed steps", async () => {
    localStorage.setItem("soft-landing:plan:London:Explore on foot", JSON.stringify(["Week 1|Explore on foot"]));
    render(<Timeline plan={plan} city="Lagos" />);
    await waitFor(() => expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false"));
  });
});