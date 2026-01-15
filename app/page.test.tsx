import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("Home Page Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Start Screen", () => {
    it("should render the start screen initially", () => {
      render(<Home />);

      expect(screen.getByText("Spell the Words")).toBeInTheDocument();
      expect(screen.getByText("Start Game")).toBeInTheDocument();
    });

    it("should have proper layout on start screen", () => {
      const { container } = render(<Home />);

      const main = container.querySelector("main");
      expect(main).toHaveClass("bg-gray-900");
      expect(main).toHaveClass("min-h-screen");
    });

    it("should start game when start button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(<Home />);

      const startButton = screen.getByText("Start Game");
      await user.click(startButton);

      // Game interface should now be visible (drop container should exist)
      const dropContainer = container.querySelector('[data-drop-container]');
      expect(dropContainer).toBeInTheDocument();
    });
  });

  describe("Game Interface (after starting)", () => {
    // Helper to render and start game
    const renderAndStartGame = async () => {
      const user = userEvent.setup();
      const result = render(<Home />);
      const startButton = screen.getByText("Start Game");
      await user.click(startButton);
      return result;
    };

    it("should render three drop slots", async () => {
      const { container } = await renderAndStartGame();

      const slot0 = container.querySelector('[data-slot-index="0"]');
      const slot1 = container.querySelector('[data-slot-index="1"]');
      const slot2 = container.querySelector('[data-slot-index="2"]');

      expect(slot0).toBeInTheDocument();
      expect(slot1).toBeInTheDocument();
      expect(slot2).toBeInTheDocument();
    });

    it("should render drop container with correct attributes", async () => {
      const { container } = await renderAndStartGame();

      const dropContainer = container.querySelector('[data-drop-container]');
      expect(dropContainer).toBeInTheDocument();
      expect(dropContainer).toHaveAttribute('data-drop-container', 'true');
    });

    it("should start with all slots empty", async () => {
      const { container } = await renderAndStartGame();

      const slot0 = container.querySelector('[data-slot-index="0"]');
      const slot1 = container.querySelector('[data-slot-index="1"]');
      const slot2 = container.querySelector('[data-slot-index="2"]');

      expect(slot0?.textContent).toBe("");
      expect(slot1?.textContent).toBe("");
      expect(slot2?.textContent).toBe("");
    });

    it("should have horizontal layout for drop slots", async () => {
      const { container } = await renderAndStartGame();

      const slotsContainer = container.querySelector('[data-drop-container]');
      expect(slotsContainer).toHaveClass("flex-row");
    });

    it("should render available letters pool", async () => {
      const { container } = await renderAndStartGame();

      const pool = container.querySelector('[data-available-area]');
      expect(pool).toBeInTheDocument();
    });

    it("should render 3 available letters", async () => {
      const { container } = await renderAndStartGame();

      const pool = container.querySelector('[data-available-area]');

      // Should have exactly 3 letters
      const letters = pool?.querySelectorAll('[draggable="true"]');
      expect(letters?.length).toBe(3);
    });

    it("should have first slot active initially", async () => {
      const { container } = await renderAndStartGame();

      const slot0 = container.querySelector('[data-slot-index="0"]');

      // Active slot has pulse animation and blue border
      expect(slot0).toHaveClass("animate-pulse");
      expect(slot0).toHaveClass("border-blue-400");
    });

    it("should render replay button", async () => {
      await renderAndStartGame();

      const replayButton = screen.getByRole("button", { name: "Replay word audio" });
      expect(replayButton).toBeInTheDocument();
    });

    it("should not render floating letter initially", async () => {
      const { container} = await renderAndStartGame();

      const floatingLetter = container.querySelector(".fixed.pointer-events-none");
      expect(floatingLetter).not.toBeInTheDocument();
    });

    it("should have proper spacing in game container", async () => {
      const { container } = await renderAndStartGame();

      const gameContainer = container.querySelector(".max-w-4xl");
      expect(gameContainer).toHaveClass("gap-8");
      expect(gameContainer).toHaveClass("justify-between");
    });

    it("should have container wrapping slots and replay button", async () => {
      const { container } = await renderAndStartGame();

      const wrapper = container.querySelector(".flex.flex-col.items-center.gap-6");
      expect(wrapper).toBeInTheDocument();

      // Should contain both the drop container and replay button
      const dropContainer = wrapper?.querySelector('[data-drop-container]');
      const replayButton = wrapper?.querySelector('button[aria-label="Replay word audio"]');

      expect(dropContainer).toBeInTheDocument();
      expect(replayButton).toBeInTheDocument();
    });

    it("should render drop slots with proper styling", async () => {
      const { container } = await renderAndStartGame();

      const slot0 = container.querySelector('[data-slot-index="0"]');

      expect(slot0).toHaveClass("w-20");
      expect(slot0).toHaveClass("h-20");
      expect(slot0).toHaveClass("rounded-lg");
      expect(slot0).toHaveClass("border-4");
      expect(slot0).toHaveClass("transition-all");
    });

    it("should have drop container as flex row", async () => {
      const { container } = await renderAndStartGame();

      const dropContainer = container.querySelector('[data-drop-container]');
      expect(dropContainer).toHaveClass("flex");
      expect(dropContainer).toHaveClass("flex-row");
      expect(dropContainer).toHaveClass("gap-6");
      expect(dropContainer).toHaveClass("justify-center");
    });
  });
});
