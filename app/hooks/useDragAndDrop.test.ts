import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragAndDrop } from "./useDragAndDrop";
import { Letter, SlotIndex } from "../types/game";

describe("useDragAndDrop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty slots", () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.slots).toEqual([null, null, null]);
    });

    it("should initialize with all letters available", () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.availableLetters).toEqual(["A", "B", "C"]);
    });

    it("should initialize with no active drag state", () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.draggingLetter).toBeNull();
      expect(result.current.dragOverSlot).toBeNull();
      expect(result.current.touchPosition).toBeNull();
    });
  });

  describe("Drag Start/End", () => {
    it("should set dragging letter on handleDragStart", () => {
      const { result } = renderHook(() => useDragAndDrop());

      act(() => {
        result.current.handleDragStart("A");
      });

      expect(result.current.draggingLetter).toBe("A");
    });

    it("should clear all drag state on handleDragEnd", () => {
      const { result } = renderHook(() => useDragAndDrop());

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDragEnd();
      });

      expect(result.current.draggingLetter).toBeNull();
      expect(result.current.dragOverSlot).toBeNull();
      expect(result.current.touchPosition).toBeNull();
    });
  });

  describe("Drag Over", () => {
    it("should set dragOverSlot on handleDragOver", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent, 1 as SlotIndex);
      });

      expect(result.current.dragOverSlot).toBe(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should clear dragOverSlot on handleDragLeave", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent, 1 as SlotIndex);
        result.current.handleDragLeave();
      });

      expect(result.current.dragOverSlot).toBeNull();
    });
  });

  describe("Placing Letters", () => {
    it("should place letter from available pool to empty slot", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      expect(result.current.slots[0]).toBe("A");
      expect(result.current.availableLetters).toEqual(["B", "C"]);
    });

    it("should place multiple letters in different slots", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("B");
        result.current.handleDrop(mockEvent, 1 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("C");
        result.current.handleDrop(mockEvent, 2 as SlotIndex);
      });

      expect(result.current.slots).toEqual(["A", "B", "C"]);
      expect(result.current.availableLetters).toEqual([]);
    });
  });

  describe("Swapping Letters", () => {
    it("should swap two letters in different slots", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("B");
        result.current.handleDrop(mockEvent, 1 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 1 as SlotIndex);
      });

      expect(result.current.slots).toEqual([null, "A", "B"]);
    });

    it("should move letter to empty slot", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 2 as SlotIndex);
      });

      expect(result.current.slots).toEqual([null, null, "A"]);
    });
  });

  describe("Returning to Pool", () => {
    it("should return letter to available pool", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDropToAvailable(mockEvent);
      });

      expect(result.current.slots[0]).toBeNull();
      expect(result.current.availableLetters).toEqual(["A", "B", "C"]);
    });

    it("should not affect available pool if dragging from pool", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDropToAvailable(mockEvent);
      });

      expect(result.current.availableLetters).toEqual(["A", "B", "C"]);
    });
  });

  describe("Touch Interactions", () => {
    it("should set dragging letter on handleTouchStart", () => {
      const { result } = renderHook(() => useDragAndDrop());

      act(() => {
        result.current.handleTouchStart("B");
      });

      expect(result.current.draggingLetter).toBe("B");
    });

    it("should update touch position on handleTouchMove", () => {
      const { result } = renderHook(() => useDragAndDrop());

      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent;

      vi.spyOn(document, "elementFromPoint").mockReturnValue(null);

      act(() => {
        result.current.handleTouchStart("A");
        result.current.handleTouchMove(mockTouchEvent);
      });

      expect(result.current.touchPosition).toEqual({ x: 100, y: 200 });
    });

    it("should detect slot on handleTouchMove", () => {
      const { result } = renderHook(() => useDragAndDrop());

      const mockSlotElement = {
        getAttribute: vi.fn().mockReturnValue("1"),
        closest: vi.fn().mockReturnThis(),
      } as unknown as Element;

      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent;

      vi.spyOn(document, "elementFromPoint").mockReturnValue(mockSlotElement);
      vi.spyOn(mockSlotElement, "closest").mockReturnValue(mockSlotElement);

      act(() => {
        result.current.handleTouchStart("A");
        result.current.handleTouchMove(mockTouchEvent);
      });

      expect(result.current.dragOverSlot).toBe(1);
    });

    it("should place letter on handleTouchEnd when over slot", () => {
      const { result } = renderHook(() => useDragAndDrop());

      const mockSlotElement = {
        getAttribute: vi.fn().mockReturnValue("0"),
        closest: vi.fn().mockReturnThis(),
      } as unknown as Element;

      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent;

      vi.spyOn(document, "elementFromPoint").mockReturnValue(mockSlotElement);
      vi.spyOn(mockSlotElement, "closest").mockReturnValue(mockSlotElement);

      act(() => {
        result.current.handleTouchStart("A");
        result.current.handleTouchMove(mockTouchEvent);
        result.current.handleTouchEnd();
      });

      expect(result.current.slots[0]).toBe("A");
      expect(result.current.draggingLetter).toBeNull();
      expect(result.current.touchPosition).toBeNull();
    });

    it("should return letter to pool on handleTouchEnd over available area", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockDropEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      const mockAvailableArea = {
        getBoundingClientRect: vi.fn().mockReturnValue({
          left: 0,
          right: 100,
          top: 0,
          bottom: 300,
        }),
      } as unknown as Element;

      const mockTouchEvent = {
        touches: [{ clientX: 50, clientY: 150 }],
      } as unknown as React.TouchEvent;

      vi.spyOn(document, "querySelector").mockReturnValue(mockAvailableArea);
      vi.spyOn(document, "elementFromPoint").mockReturnValue(null);

      act(() => {
        result.current.handleDragStart("A");
        result.current.handleDrop(mockDropEvent, 0 as SlotIndex);
      });

      act(() => {
        result.current.handleTouchStart("A");
        result.current.handleTouchMove(mockTouchEvent);
        result.current.handleTouchEnd();
      });

      expect(result.current.slots[0]).toBeNull();
      expect(result.current.availableLetters).toEqual(["A", "B", "C"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle drop without active drag", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(mockEvent, 0 as SlotIndex);
      });

      expect(result.current.slots).toEqual([null, null, null]);
    });

    it("should handle dropToAvailable without active drag", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDropToAvailable(mockEvent);
      });

      expect(result.current.availableLetters).toEqual(["A", "B", "C"]);
    });

    it("should handle touchMove without active drag", () => {
      const { result } = renderHook(() => useDragAndDrop());
      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.handleTouchMove(mockTouchEvent);
      });

      expect(result.current.touchPosition).toBeNull();
    });
  });
});
