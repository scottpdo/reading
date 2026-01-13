import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingLetter } from "./FloatingLetter";
import { TouchPosition } from "../types/game";

describe("FloatingLetter", () => {
  it("should render the letter correctly", () => {
    const position: TouchPosition = { x: 100, y: 200 };
    render(<FloatingLetter letter="A" position={position} />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should position the letter centered on touch coordinates", () => {
    const position: TouchPosition = { x: 150, y: 250 };
    const { container } = render(<FloatingLetter letter="B" position={position} />);

    const floatingDiv = container.querySelector(".fixed");
    expect(floatingDiv).toHaveStyle({ left: "110px", top: "210px" });
  });

  it("should handle zero coordinates", () => {
    const position: TouchPosition = { x: 0, y: 0 };
    const { container } = render(<FloatingLetter letter="C" position={position} />);

    const floatingDiv = container.querySelector(".fixed");
    expect(floatingDiv).toHaveStyle({ left: "-40px", top: "-40px" });
  });

  it("should have fixed positioning class", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    const { container } = render(<FloatingLetter letter="A" position={position} />);

    const floatingDiv = container.firstChild;
    expect(floatingDiv).toHaveClass("fixed");
  });

  it("should have pointer-events-none class", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    const { container } = render(<FloatingLetter letter="A" position={position} />);

    const floatingDiv = container.firstChild;
    expect(floatingDiv).toHaveClass("pointer-events-none");
  });

  it("should have high z-index", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    const { container } = render(<FloatingLetter letter="A" position={position} />);

    const floatingDiv = container.firstChild;
    expect(floatingDiv).toHaveClass("z-50");
  });

  it("should have correct letter styling", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    render(<FloatingLetter letter="A" position={position} />);

    const letter = screen.getByText("A");
    expect(letter).toHaveClass("w-20");
    expect(letter).toHaveClass("h-20");
    expect(letter).toHaveClass("bg-blue-600");
    expect(letter).toHaveClass("text-white");
    expect(letter).toHaveClass("text-4xl");
    expect(letter).toHaveClass("font-bold");
  });

  it("should have opacity styling", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    render(<FloatingLetter letter="A" position={position} />);

    const letter = screen.getByText("A");
    expect(letter).toHaveClass("opacity-90");
  });

  it("should have shadow styling", () => {
    const position: TouchPosition = { x: 100, y: 100 };
    render(<FloatingLetter letter="A" position={position} />);

    const letter = screen.getByText("A");
    expect(letter).toHaveClass("shadow-2xl");
  });

  it("should render different letters correctly", () => {
    const position: TouchPosition = { x: 100, y: 100 };

    const { rerender } = render(<FloatingLetter letter="A" position={position} />);
    expect(screen.getByText("A")).toBeInTheDocument();

    rerender(<FloatingLetter letter="B" position={position} />);
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();

    rerender(<FloatingLetter letter="C" position={position} />);
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
  });

  it("should update position when position prop changes", () => {
    const initialPosition: TouchPosition = { x: 100, y: 100 };
    const { container, rerender } = render(
      <FloatingLetter letter="A" position={initialPosition} />
    );

    let floatingDiv = container.querySelector(".fixed");
    expect(floatingDiv).toHaveStyle({ left: "60px", top: "60px" });

    const newPosition: TouchPosition = { x: 200, y: 300 };
    rerender(<FloatingLetter letter="A" position={newPosition} />);

    floatingDiv = container.querySelector(".fixed");
    expect(floatingDiv).toHaveStyle({ left: "160px", top: "260px" });
  });
});
