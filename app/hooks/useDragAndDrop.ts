import { useState } from "react";
import { Letter, SlotIndex, TouchPosition } from "../types/game";

export function useDragAndDrop() {
  const [slots, setSlots] = useState<(Letter | null)[]>([null, null, null]);
  const [dragOverSlot, setDragOverSlot] = useState<SlotIndex | null>(null);
  const [draggingLetter, setDraggingLetter] = useState<Letter | null>(null);
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);

  const availableLetters: Letter[] = (["A", "B", "C"] as Letter[]).filter(
    (letter) => !slots.includes(letter)
  );

  const handleDragStart = (letter: Letter) => {
    setDraggingLetter(letter);
  };

  const handleDragEnd = () => {
    setDraggingLetter(null);
    setDragOverSlot(null);
    setTouchPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: SlotIndex) => {
    e.preventDefault();
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlotIndex: SlotIndex) => {
    e.preventDefault();

    if (!draggingLetter) return;

    const newSlots = [...slots];
    const sourceSlotIndex = slots.indexOf(draggingLetter);

    if (sourceSlotIndex !== -1) {
      const targetLetter = newSlots[targetSlotIndex];
      newSlots[sourceSlotIndex] = targetLetter;
      newSlots[targetSlotIndex] = draggingLetter;
    } else {
      newSlots[targetSlotIndex] = draggingLetter;
    }

    setSlots(newSlots);
    setDragOverSlot(null);
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();

    if (!draggingLetter) return;

    const sourceSlotIndex = slots.indexOf(draggingLetter);
    if (sourceSlotIndex !== -1) {
      const newSlots = [...slots];
      newSlots[sourceSlotIndex] = null;
      setSlots(newSlots);
    }

    setDraggingLetter(null);
  };

  const handleTouchStart = (letter: Letter) => {
    setDraggingLetter(letter);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingLetter) return;

    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = element?.closest("[data-slot-index]");

    if (slotElement) {
      const slotIndex = parseInt(
        slotElement.getAttribute("data-slot-index") || "-1"
      );
      if (slotIndex >= 0 && slotIndex <= 2) {
        setDragOverSlot(slotIndex as SlotIndex);
      }
    } else {
      setDragOverSlot(null);
    }
  };

  const handleTouchEnd = () => {
    if (!draggingLetter) {
      setDraggingLetter(null);
      setDragOverSlot(null);
      setTouchPosition(null);
      return;
    }

    if (touchPosition && dragOverSlot === null) {
      const sourceSlotIndex = slots.indexOf(draggingLetter);
      if (sourceSlotIndex !== -1) {
        const availableArea = document.querySelector("[data-available-area]");
        if (availableArea) {
          const rect = availableArea.getBoundingClientRect();
          if (
            touchPosition.x >= rect.left &&
            touchPosition.x <= rect.right &&
            touchPosition.y >= rect.top &&
            touchPosition.y <= rect.bottom
          ) {
            const newSlots = [...slots];
            newSlots[sourceSlotIndex] = null;
            setSlots(newSlots);
          }
        }
      }
      setDraggingLetter(null);
      setDragOverSlot(null);
      setTouchPosition(null);
      return;
    }

    if (dragOverSlot === null) {
      setDraggingLetter(null);
      setDragOverSlot(null);
      setTouchPosition(null);
      return;
    }

    const newSlots = [...slots];
    const sourceSlotIndex = slots.indexOf(draggingLetter);

    if (sourceSlotIndex !== -1) {
      const targetLetter = newSlots[dragOverSlot];
      newSlots[sourceSlotIndex] = targetLetter;
      newSlots[dragOverSlot] = draggingLetter;
    } else {
      newSlots[dragOverSlot] = draggingLetter;
    }

    setSlots(newSlots);
    setDraggingLetter(null);
    setDragOverSlot(null);
    setTouchPosition(null);
  };

  return {
    slots,
    dragOverSlot,
    draggingLetter,
    touchPosition,
    availableLetters,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropToAvailable,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
