import { useState } from "react";
import { Letter, SlotIndex, TouchPosition, DropHandler, CanDragFrom } from "../types/game";

interface UseDragAndDropMechanicsProps {
  onDrop: DropHandler;
  canDragFrom: CanDragFrom;
  activeSlot: SlotIndex; // The currently active slot for placement
}

export function useDragAndDropMechanics({
  onDrop,
  canDragFrom,
  activeSlot
}: UseDragAndDropMechanicsProps) {
  const [draggingLetter, setDraggingLetter] = useState<Letter | null>(null);
  const [isDragOverContainer, setIsDragOverContainer] = useState<boolean>(false);
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);

  const clearDragState = () => {
    setDraggingLetter(null);
    setIsDragOverContainer(false);
    setTouchPosition(null);
  };

  // Consolidated drop processing logic - always drops to active slot
  const processDrop = (letter: Letter) => {
    if (!letter) return;

    // Check if can drag from source
    if (!canDragFrom(letter)) {
      clearDragState();
      return;
    }

    // Always attempt drop to active slot
    onDrop(letter, activeSlot);

    // Always clear drag state (caller handles UI feedback)
    clearDragState();
  };

  const handleDragStart = (letter: Letter) => {
    setDraggingLetter(letter);
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  // Container-level drag handlers
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContainer(true);
  };

  const handleContainerDragLeave = () => {
    setIsDragOverContainer(false);
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingLetter) return;
    processDrop(draggingLetter);
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

    // Check if touch is over the drop container
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const containerElement = element?.closest("[data-drop-container]");

    if (containerElement) {
      setIsDragOverContainer(true);
    } else {
      setIsDragOverContainer(false);
    }
  };

  const handleTouchEnd = () => {
    if (!draggingLetter) {
      clearDragState();
      return;
    }

    // Only process drop if we're over the container
    if (!isDragOverContainer) {
      clearDragState();
      return;
    }

    processDrop(draggingLetter);
  };

  return {
    // State
    draggingLetter,
    isDragOverContainer,
    touchPosition,

    // Mouse handlers (for letters)
    handleDragStart,
    handleDragEnd,

    // Container-level mouse handlers
    handleContainerDragOver,
    handleContainerDragLeave,
    handleContainerDrop,
    handleDropToAvailable,

    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
