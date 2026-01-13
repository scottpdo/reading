import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DraggableLetter } from "./DraggableLetter";
import userEvent from "@testing-library/user-event";

describe("DraggableLetter", () => {
  const mockHandlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
  };

  it("should render the letter correctly", () => {
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should show box styling when showBox is true", () => {
    render(<DraggableLetter letter="B" {...mockHandlers} showBox={true} />);

    const element = screen.getByText("B");
    expect(element).toHaveClass("bg-blue-600");
    expect(element).toHaveClass("rounded-lg");
  });

  it("should not show box styling when showBox is false", () => {
    render(<DraggableLetter letter="C" {...mockHandlers} showBox={false} />);

    const element = screen.getByText("C");
    expect(element).not.toHaveClass("bg-blue-600");
  });

  it("should have draggable attribute", () => {
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    const element = screen.getByText("A");
    expect(element).toHaveAttribute("draggable", "true");
  });

  it("should have correct accessibility classes", () => {
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    const element = screen.getByText("A");
    expect(element).toHaveClass("cursor-move");
    expect(element).toHaveClass("touch-none");
    expect(element).toHaveClass("select-none");
  });

  it("should call onDragStart with letter when drag starts", async () => {
    const user = userEvent.setup();
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    const element = screen.getByText("A");
    await user.pointer({ keys: "[MouseLeft>]", target: element });

    expect(mockHandlers.onDragStart).toHaveBeenCalledWith("A");
  });

  it("should call onTouchStart with letter when touch starts", () => {
    render(<DraggableLetter letter="B" {...mockHandlers} />);

    const element = screen.getByText("B");
    element.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

    expect(mockHandlers.onTouchStart).toHaveBeenCalledWith("B");
  });

  it("should have text styling classes", () => {
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    const element = screen.getByText("A");
    expect(element).toHaveClass("text-white");
    expect(element).toHaveClass("text-4xl");
    expect(element).toHaveClass("font-bold");
  });

  it("should have transition classes", () => {
    render(<DraggableLetter letter="A" {...mockHandlers} />);

    const element = screen.getByText("A");
    expect(element).toHaveClass("active:scale-95");
    expect(element).toHaveClass("transition-transform");
  });
});
