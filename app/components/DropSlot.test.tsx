import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropSlot } from "./DropSlot";
import { SlotIndex } from "../types/game";

describe("DropSlot", () => {
  const mockHandlers = {
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onTouchStart: vi.fn(),
    onTouchMove: vi.fn(),
    onTouchEnd: vi.fn(),
  };

  it("should render empty slot correctly", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    expect(slot).toBeInTheDocument();
    expect(slot?.textContent).toBe("");
  });

  it("should render slot with letter", () => {
    render(
      <DropSlot
        letter="A"
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should have correct slot index data attribute", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={2 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="2"]');
    expect(slot).toBeInTheDocument();
  });

  it("should apply normal styling when not highlighted", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    expect(slot).toHaveClass("border-solid");
    expect(slot).toHaveClass("border-gray-600");
    expect(slot).toHaveClass("bg-gray-800");
  });

  it("should apply highlighted styling when isHighlighted is true", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={true}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    expect(slot).toHaveClass("border-dashed");
    expect(slot).toHaveClass("border-yellow-400");
    expect(slot).toHaveClass("bg-yellow-400/10");
  });

  it("should have correct size styling", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    expect(slot).toHaveClass("w-20");
    expect(slot).toHaveClass("h-20");
    expect(slot).toHaveClass("rounded-lg");
  });

  it("should call onDragOver with slot index", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={1 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="1"]');
    const mockEvent = new Event("dragover", { bubbles: true });

    slot?.dispatchEvent(mockEvent);

    expect(mockHandlers.onDragOver).toHaveBeenCalled();
  });

  it("should call onDragLeave when drag leaves", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    const mockEvent = new Event("dragleave", { bubbles: true });

    slot?.dispatchEvent(mockEvent);

    expect(mockHandlers.onDragLeave).toHaveBeenCalled();
  });

  it("should call onDrop with slot index", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={2 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="2"]');
    const mockEvent = new Event("drop", { bubbles: true });

    slot?.dispatchEvent(mockEvent);

    expect(mockHandlers.onDrop).toHaveBeenCalled();
  });

  it("should render letter without box when letter is present", () => {
    render(
      <DropSlot
        letter="B"
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const letter = screen.getByText("B");
    expect(letter).not.toHaveClass("bg-blue-600");
  });

  it("should pass touch handlers to draggable letter", () => {
    render(
      <DropSlot
        letter="C"
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const letter = screen.getByText("C");
    letter.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

    expect(mockHandlers.onTouchStart).toHaveBeenCalledWith("C");
  });

  it("should have transition classes", () => {
    const { container } = render(
      <DropSlot
        letter={null}
        slotIndex={0 as SlotIndex}
        isHighlighted={false}
        {...mockHandlers}
      />
    );

    const slot = container.querySelector('[data-slot-index="0"]');
    expect(slot).toHaveClass("transition-all");
  });
});
