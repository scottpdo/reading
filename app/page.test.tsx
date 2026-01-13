import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("Home Page Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the game interface", () => {
    render(<Home />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should render available letters pool", () => {
    const { container } = render(<Home />);

    const pool = container.querySelector('[data-available-area]');
    expect(pool).toBeInTheDocument();
  });

  it("should render three drop slots", () => {
    const { container } = render(<Home />);

    const slot0 = container.querySelector('[data-slot-index="0"]');
    const slot1 = container.querySelector('[data-slot-index="1"]');
    const slot2 = container.querySelector('[data-slot-index="2"]');

    expect(slot0).toBeInTheDocument();
    expect(slot1).toBeInTheDocument();
    expect(slot2).toBeInTheDocument();
  });

  it("should start with all slots empty", () => {
    const { container } = render(<Home />);

    const slot0 = container.querySelector('[data-slot-index="0"]');
    const slot1 = container.querySelector('[data-slot-index="1"]');
    const slot2 = container.querySelector('[data-slot-index="2"]');

    expect(slot0?.textContent).toBe("");
    expect(slot1?.textContent).toBe("");
    expect(slot2?.textContent).toBe("");
  });

  it("should have horizontal layout for drop slots", () => {
    const { container } = render(<Home />);

    const slotsContainer = container.querySelector(".flex-row");
    expect(slotsContainer).toBeInTheDocument();
  });

  it("should place letter when dragged to slot", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterA = screen.getByText("A");
    const slot0 = container.querySelector('[data-slot-index="0"]');

    expect(slot0).toBeInTheDocument();

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterA },
      { coords: { x: 400, y: 300 } },
      { keys: "[/MouseLeft]", target: slot0! },
    ]);

    const updatedSlot0 = container.querySelector('[data-slot-index="0"]');
    expect(within(updatedSlot0 as HTMLElement).queryByText("A")).toBeInTheDocument();
  });

  it("should remove letter from available pool after placement", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterB = screen.getByText("B");
    const slot1 = container.querySelector('[data-slot-index="1"]');

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterB },
      { keys: "[/MouseLeft]", target: slot1! },
    ]);

    const availablePool = container.querySelector('[data-available-area]');
    expect(within(availablePool as HTMLElement).queryByText("B")).not.toBeInTheDocument();
  });

  it("should swap two letters when dragging one to occupied slot", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterA = screen.getByText("A");
    const letterB = screen.getByText("B");
    const slot0 = container.querySelector('[data-slot-index="0"]');
    const slot1 = container.querySelector('[data-slot-index="1"]');

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterA },
      { keys: "[/MouseLeft]", target: slot0! },
    ]);

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterB },
      { keys: "[/MouseLeft]", target: slot1! },
    ]);

    const placedA = within(slot0 as HTMLElement).getByText("A");

    await user.pointer([
      { keys: "[MouseLeft>]", target: placedA },
      { keys: "[/MouseLeft]", target: slot1! },
    ]);

    expect(within(slot1 as HTMLElement).queryByText("A")).toBeInTheDocument();
    expect(within(slot0 as HTMLElement).queryByText("B")).toBeInTheDocument();
  });

  it("should return letter to pool when dragged back", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterC = screen.getByText("C");
    const slot2 = container.querySelector('[data-slot-index="2"]');
    const availablePool = container.querySelector('[data-available-area]');

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterC },
      { keys: "[/MouseLeft]", target: slot2! },
    ]);

    expect(within(availablePool as HTMLElement).queryByText("C")).not.toBeInTheDocument();

    const placedC = within(slot2 as HTMLElement).getByText("C");

    await user.pointer([
      { keys: "[MouseLeft>]", target: placedC },
      { keys: "[/MouseLeft]", target: availablePool! },
    ]);

    expect(within(availablePool as HTMLElement).queryByText("C")).toBeInTheDocument();
    expect(slot2?.textContent).toBe("");
  });

  it("should handle placing all three letters", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterA = screen.getByText("A");
    const letterB = screen.getByText("B");
    const letterC = screen.getByText("C");

    const slot0 = container.querySelector('[data-slot-index="0"]');
    const slot1 = container.querySelector('[data-slot-index="1"]');
    const slot2 = container.querySelector('[data-slot-index="2"]');

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterA },
      { keys: "[/MouseLeft]", target: slot0! },
    ]);

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterB },
      { keys: "[/MouseLeft]", target: slot1! },
    ]);

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterC },
      { keys: "[/MouseLeft]", target: slot2! },
    ]);

    expect(within(slot0 as HTMLElement).queryByText("A")).toBeInTheDocument();
    expect(within(slot1 as HTMLElement).queryByText("B")).toBeInTheDocument();
    expect(within(slot2 as HTMLElement).queryByText("C")).toBeInTheDocument();

    const availablePool = container.querySelector('[data-available-area]');
    expect(within(availablePool as HTMLElement).queryByText("A")).not.toBeInTheDocument();
    expect(within(availablePool as HTMLElement).queryByText("B")).not.toBeInTheDocument();
    expect(within(availablePool as HTMLElement).queryByText("C")).not.toBeInTheDocument();
  });

  it("should move letter to empty slot", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);

    const letterA = screen.getByText("A");
    const slot0 = container.querySelector('[data-slot-index="0"]');
    const slot2 = container.querySelector('[data-slot-index="2"]');

    await user.pointer([
      { keys: "[MouseLeft>]", target: letterA },
      { keys: "[/MouseLeft]", target: slot0! },
    ]);

    const placedA = within(slot0 as HTMLElement).getByText("A");

    await user.pointer([
      { keys: "[MouseLeft>]", target: placedA },
      { keys: "[/MouseLeft]", target: slot2! },
    ]);

    expect(slot0?.textContent).toBe("");
    expect(within(slot2 as HTMLElement).queryByText("A")).toBeInTheDocument();
  });

  it("should not render floating letter initially", () => {
    const { container } = render(<Home />);

    const floatingLetter = container.querySelector(".fixed.pointer-events-none");
    expect(floatingLetter).not.toBeInTheDocument();
  });

  it("should have proper layout structure", () => {
    const { container } = render(<Home />);

    const main = container.querySelector("main");
    expect(main).toHaveClass("bg-gray-900");
    expect(main).toHaveClass("min-h-screen");
  });

  it("should have proper spacing between elements", () => {
    const { container } = render(<Home />);

    const gameContainer = container.querySelector(".max-w-4xl");
    expect(gameContainer).toHaveClass("gap-8");
    expect(gameContainer).toHaveClass("justify-between");
  });
});
