import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LetterPool } from "./LetterPool";
import { Letter } from "../types/game";

describe("LetterPool", () => {
  const mockHandlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
    onDrop: vi.fn(),
  };

  it("should render all available letters", () => {
    const letters: Letter[] = ["A", "B", "C"];
    render(<LetterPool letters={letters} {...mockHandlers} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should render subset of letters", () => {
    const letters: Letter[] = ["A", "C"];
    render(<LetterPool letters={letters} {...mockHandlers} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should render empty when no letters available", () => {
    const letters: Letter[] = [];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const letterElements = container.querySelectorAll('[draggable="true"]');
    expect(letterElements.length).toBe(0);
  });

  it("should have data-available-area attribute", () => {
    const letters: Letter[] = ["A"];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const pool = container.querySelector('[data-available-area]');
    expect(pool).toBeInTheDocument();
  });

  it("should have correct container styling", () => {
    const letters: Letter[] = ["A"];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const pool = container.querySelector('[data-available-area]');
    expect(pool).toHaveClass("flex-col");
    expect(pool).toHaveClass("min-h-[300px]");
    expect(pool).toHaveClass("border-2");
    expect(pool).toHaveClass("border-gray-700");
  });

  it("should call onDrop when drop event occurs", () => {
    const letters: Letter[] = ["A"];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const pool = container.querySelector('[data-available-area]');
    const mockEvent = new Event("drop", { bubbles: true });

    pool?.dispatchEvent(mockEvent);

    expect(mockHandlers.onDrop).toHaveBeenCalled();
  });

  it("should prevent default on dragOver", () => {
    const letters: Letter[] = ["A"];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const pool = container.querySelector('[data-available-area]');
    const mockEvent = new Event("dragover", { bubbles: true, cancelable: true });

    const defaultPrevented = !pool?.dispatchEvent(mockEvent);
    expect(defaultPrevented).toBe(true);
  });

  it("should pass handlers to DraggableLetter components", () => {
    const letters: Letter[] = ["A", "B"];
    render(<LetterPool letters={letters} {...mockHandlers} />);

    const letterA = screen.getByText("A");
    letterA.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

    expect(mockHandlers.onTouchStart).toHaveBeenCalledWith("A");
  });

  it("should have transition wrapper with opacity classes", () => {
    const letters: Letter[] = ["A"];
    const { container } = render(<LetterPool letters={letters} {...mockHandlers} />);

    const transitionWrapper = container.querySelector('.transition-opacity');
    expect(transitionWrapper).toBeInTheDocument();
    expect(transitionWrapper).toHaveClass('duration-300');
  });

  it("should update displayed letters when letters prop changes", async () => {
    const letters: Letter[] = ["A", "B", "C"];
    const { rerender } = render(<LetterPool letters={letters} {...mockHandlers} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();

    // Change letters
    const newLetters: Letter[] = ["D", "E", "F"];
    rerender(<LetterPool letters={newLetters} {...mockHandlers} />);

    // After transition, new letters should be displayed
    // Note: In real usage there's a 150ms delay, but test will see the eventual state
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.getByText("F")).toBeInTheDocument();
  });
});
