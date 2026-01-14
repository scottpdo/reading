import { useState } from "react";
import { Letter, SlotIndex, TouchPosition, DropHandler, CanDragFrom } from "../types/game";

interface UseDragAndDropMechanicsProps {
  onDrop: DropHandler;
  canDragFrom: CanDragFrom;
}

export function useDragAndDropMechanics({
  onDrop,
  canDragFrom
}: UseDragAndDropMechanicsProps) {
  const [draggingLetter, setDraggingLetter] = useState<Letter | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<SlotIndex | null>(null);
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);

  const clearDragState = () => {
    setDraggingLetter(null);
    setDragOverSlot(null);
    setTouchPosition(null);
  };

  // Consolidated drop processing logic
  const processDrop = (letter: Letter, targetSlot: SlotIndex) => {
    if (!letter) return;

    // Check if can drag from source
    if (!canDragFrom(letter)) {
      clearDragState();
      return;
    }

    // Attempt drop via callback
    onDrop(letter, targetSlot);

    // Always clear drag state (caller handles UI feedback)
    clearDragState();
  };

  const handleDragStart = (letter: Letter) => {
    setDraggingLetter(letter);
  };

  const handleDragEnd = () => {
    clearDragState();
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
    processDrop(draggingLetter, targetSlotIndex);
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    // Letters are now locked once placed, so this handler is a no-op
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
      clearDragState();
      return;
    }

    if (dragOverSlot === null) {
      clearDragState();
      return;
    }

    processDrop(draggingLetter, dragOverSlot);
  };

  return {
    // State
    draggingLetter,
    dragOverSlot,
    touchPosition,

    // Mouse handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropToAvailable,

    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
