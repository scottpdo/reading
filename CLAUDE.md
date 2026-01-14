# Claude Development Guide

## Project Overview

This is a CVC (consonant-vowel-consonant) word spelling game built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Players drag letters to spell simple three-letter words in sequence.

## Architecture

### Hook Separation (Refactored for Maintainability)

The codebase follows a clean separation of concerns pattern with two specialized hooks coordinated by an integration layer:

#### 1. Game Logic Hook (`app/hooks/useLetterGameLogic.ts`)
**Responsibility**: CVC word game rules, validation, and state management

**Key Functions**:
- `attemptPlacement(letter, slot)` - Validates and processes letter placement attempts
  - Returns `PlacementResult` with `success`, `type` ('invalid' | 'position-advanced' | 'word-completed'), and optional `reason`
  - Updates slots state and advances position on success
- `advanceToNextWord()` - Progresses to next word or marks game complete
- `resetGame()` - Reshuffles word bank and resets all state
- `isSlotSource(letter)` - Checks if letter is already placed (for drag prevention)

**State Managed**:
- `gameState` - word bank, current word/position, completion tracking
- `slots` - placed letters with locked status
- `availableLetters` - 3 letters (correct + 2 random distractors, shuffled)
- `currentWord` - current CVC word tuple

**Key Implementation Details**:
- Uses `useState` with lazy initializer for word bank shuffling
- `availableLetters` stored in state to prevent re-randomization during React strict mode double-mount
- `useEffect` logs current word on word index change (for debugging until audio added)
- Fisher-Yates shuffle algorithm for true randomization

#### 2. Drag-and-Drop Mechanics Hook (`app/hooks/useDragAndDropMechanics.ts`)
**Responsibility**: Generic drag-and-drop interaction handling

**Key Functions**:
- `processDrop(letter, slot)` - Consolidated drop logic for both mouse and touch
  - Checks `canDragFrom` callback
  - Calls `onDrop` callback for validation
  - Clears drag state
- Mouse handlers: `handleDragStart`, `handleDragEnd`, `handleDragOver`, `handleDragLeave`, `handleDrop`, `handleDropToAvailable`
- Touch handlers: `handleTouchStart`, `handleTouchMove`, `handleTouchEnd`

**State Managed**:
- `draggingLetter` - which letter is being dragged
- `dragOverSlot` - which slot cursor is hovering over
- `touchPosition` - x/y coordinates for floating letter on touch devices

**Props (Callbacks)**:
- `onDrop: (letter, slot) => { accepted: boolean }` - Validates drop attempts
- `canDragFrom: (letter) => boolean` - Prevents dragging locked letters

**Key Implementation Details**:
- Mouse and touch logic consolidated via shared `processDrop` function (eliminated ~70 lines of duplication)
- Touch handling uses `document.elementFromPoint` for slot detection
- Reusable for other drag-and-drop games

#### 3. Integration Layer (`app/page.tsx`)
**Responsibility**: Coordinate hooks and manage UI feedback

**Key Implementation**:
```typescript
const gameLogic = useLetterGameLogic();
const dragMechanics = useDragAndDropMechanics({
  onDrop: handleDropAttempt,
  canDragFrom: (letter) => !gameLogic.isSlotSource(letter)
});
```

**UI Feedback State** (moved from hooks for better separation):
- `showError` - which slot to animate red (500ms timeout)
- `showSuccess` - whether to show success modal (2s auto-advance)
- `errorTimeoutRef` / `successTimeoutRef` - cleanup on unmount/reset

**Bridge Function** (`handleDropAttempt`):
1. Calls `gameLogic.attemptPlacement(letter, slot)`
2. On error: sets `showError`, schedules clear timeout
3. On word complete: sets `showSuccess`, schedules `advanceToNextWord`
4. Returns `{ accepted: boolean }` to drag mechanics

## Game Flow

### Word Progression
1. Game loads with 10 CVC words shuffled using Fisher-Yates algorithm
2. Console logs current word (temporary until audio implementation)
3. Letter pool displays 3 letters: correct letter + 2 random distractors (shuffled)
4. Active slot (currentPosition) pulses blue to indicate where to place next letter
5. Player must fill slots sequentially: position 0 → 1 → 2

### Validation Rules
- Letters can only be placed in the active position (currentPosition)
- Placed letters are locked and cannot be dragged
- Slot-to-slot dragging is prevented via `canDragFrom` check
- Only the correct letter is accepted for each position

### Feedback Mechanisms
- **Correct placement**: Letter locks in slot, position advances, pool regenerates
- **Incorrect letter**: Slot flashes red with shake animation (500ms), letter returns to pool
- **Wrong position**: Same error feedback as incorrect letter
- **Word completion**: Success modal appears, auto-advances after 2 seconds
- **Game completion**: Win modal with "Play Again" button (reshuffles word bank)

## Component Structure

### Core Components
- `LetterPool` - Displays available letters in vertical stack
- `DropSlot` - Individual slot with visual states (active/highlighted/error/default)
- `DraggableLetter` - Reusable letter element with optional box styling and lock state
- `FloatingLetter` - Follows touch position for visual feedback
- `SuccessModal` - Word completion celebration
- `WinModal` - Game completion with restart

### Visual States
- **Active slot**: Blue dashed border + pulse animation (`isActive && !letter`)
- **Highlighted slot**: Yellow dashed border (`isHighlighted` via drag over)
- **Error slot**: Red border + shake animation (`showError`)
- **Default slot**: Gray border
- **Locked letter**: `cursor-default`, no hover effects

## Type System

### Key Types (`app/types/game.ts`)
```typescript
Letter = "A" | "B" | ... | "Z"
SlotIndex = 0 | 1 | 2
CVCWord = [Letter, Letter, Letter]  // Tuple for type safety

LetterState = { letter: Letter, isLocked: boolean }

PlacementResult = {
  success: boolean,
  type: 'invalid' | 'position-advanced' | 'word-completed',
  reason?: string
}

// Callback types
DropHandler = (letter, slot) => { accepted: boolean }
CanDragFrom = (letter) => boolean
```

## Styling

### Animations (`app/globals.css`)
- `animate-shake` - Error feedback (translateX wobble, 500ms)
- `animate-bounce-in` - Modal entrance (scale bounce, 500ms)
- `animate-pulse` - Built-in Tailwind for active slot

### Responsive Design
- Fixed viewport height with `dvh` for mobile URL bar
- `overflow: hidden` prevents scrolling
- Touch optimizations: `touch-none`, `select-none`, `overscroll-behavior: none`
- PWA support with safe area insets
- Landscape mode optimizations

## State Ownership Matrix

| State | Owner | Rationale |
|-------|-------|-----------|
| wordBank, currentWordIndex, currentPosition | Game Logic | Core progression state |
| slots, availableLetters | Game Logic | Game-specific letter management |
| draggingLetter, dragOverSlot, touchPosition | Drag Mechanics | Interaction tracking |
| showError, showSuccess, timeouts | Integration Layer | UI feedback coordination |

## Development Guidelines

### Adding New Words
Edit `CVC_WORDS` array in `useLetterGameLogic.ts`. Must be 3-letter tuples:
```typescript
["N", "E", "W"]  // Correct
["WORD"]         // Wrong - not a tuple
```

### Modifying Validation Rules
Edit `attemptPlacement` function in `useLetterGameLogic.ts`. Return `PlacementResult` with appropriate type and reason.

### Reusing Drag Mechanics
The `useDragAndDropMechanics` hook is game-agnostic. Just provide:
- `onDrop` callback for validation
- `canDragFrom` callback for source restrictions

Example for different game:
```typescript
const dragMechanics = useDragAndDropMechanics({
  onDrop: (item, target) => {
    // Your game logic here
    return { accepted: isValidMove(item, target) };
  },
  canDragFrom: (item) => !isLocked(item)
});
```

### Testing Strategy
- **Game logic tests**: Test validation, progression, and word management in isolation
- **Drag mechanics tests**: Test drag state, callbacks, and event handling
- **Integration tests**: Test coordination, UI feedback timing, and error handling

## Known Issues & Future Work

### Current Limitations
- Audio playback not yet implemented (console logs current word as placeholder)
- Test files need updating for refactored hooks (DropSlot.test.tsx has prop errors)
- No persistent progress or scoring
- Limited to 10 hardcoded words

### Planned Enhancements
1. **Audio**: Add MP3 files for each word, play on word start
2. **Sound effects**: Correct placement, error feedback, word completion
3. **Multiple word banks**: Easy/medium/hard difficulty levels
4. **Progress tracking**: Save completed words, track statistics
5. **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
6. **Animations**: Smoother letter transitions, celebration effects

## Performance Notes

### Optimization Decisions
1. **availableLetters as state** (not computed): Prevents re-randomization during strict mode double-mount
2. **Lazy state initialization**: Word bank shuffled only once per component lifecycle
3. **useEffect for logging**: Only runs on word index change, not every render
4. **Consolidated drop logic**: Single `processDrop` function prevents duplicate code execution

### React 18+ Features
- Automatic batching handles multiple setState calls in integration layer
- Strict mode double-mount intentionally tests for side effects
- Concurrent features available (not currently used)

## Build & Deploy

### Development
```bash
npm run dev  # Starts on port 3000 (or 3001 if 3000 in use)
```

### Production
```bash
npm run build  # TypeScript compilation + Next.js optimization
npm start      # Serves production build
```

### Type Checking
```bash
npx tsc --noEmit  # Verify TypeScript without building
```

## File Structure

```
app/
├── hooks/
│   ├── useLetterGameLogic.ts      # Game state and rules (210 lines)
│   ├── useDragAndDropMechanics.ts # Drag interaction (130 lines)
│   └── useDragAndDrop.test.ts     # Legacy tests (needs splitting)
├── components/
│   ├── LetterPool.tsx             # Available letters container
│   ├── DropSlot.tsx               # Individual placement target
│   ├── DraggableLetter.tsx        # Reusable letter element
│   ├── FloatingLetter.tsx         # Touch drag preview
│   ├── SuccessModal.tsx           # Word completion feedback
│   ├── WinModal.tsx               # Game completion screen
│   └── *.test.tsx                 # Component tests
├── types/
│   └── game.ts                    # TypeScript type definitions
├── page.tsx                       # Main app with integration layer (120 lines)
└── globals.css                    # Animations and responsive styles
```

## Common Patterns

### State Updates
Always use functional updates for state that depends on previous value:
```typescript
// Good
setGameState(prev => ({ ...prev, currentPosition: nextPosition }));

// Bad (can be stale in timeouts/callbacks)
setGameState({ ...gameState, currentPosition: nextPosition });
```

### Timeout Cleanup
Always clear timeouts in cleanup and reset:
```typescript
if (timeoutRef.current) clearTimeout(timeoutRef.current);
timeoutRef.current = setTimeout(() => {
  // Your logic
}, delay);
```

### Type Safety
Use `as SlotIndex` only after runtime validation:
```typescript
if (index >= 0 && index <= 2) {
  setCurrentPosition(index as SlotIndex);  // Safe
}
```

## Debugging Tips

### Console Logs
- "Current word: XXX" logged on word change (via useEffect in useLetterGameLogic)
- Should appear twice on initial mount (React strict mode) but with same word
- Logs once per word advance

### Common Issues
1. **Letters reshuffling on mount**: Check availableLetters is in state, not computed
2. **Validation not working**: Verify currentPosition matches targetSlot in attemptPlacement
3. **Timeouts not clearing**: Ensure refs are cleared in both error path and reset
4. **Drag not working**: Check canDragFrom callback isn't blocking source
5. **Modal not appearing**: Verify showSuccess/showError state in integration layer

### React DevTools
- Check gameState.currentPosition to see which slot should be active
- Inspect slots array for LetterState objects with isLocked flag
- Monitor dragMechanics state during drag operations

## Architecture Benefits

### Why Separate Hooks?
1. **Single Responsibility**: Each hook has one clear purpose
2. **Testability**: Game logic tested without DOM, drag mechanics tested without game rules
3. **Reusability**: Drag mechanics reusable for other games
4. **Maintainability**: Changes to validation don't affect drag handling
5. **Code Clarity**: 400 lines split across 3 files vs 390 in one monolithic hook

### Trade-offs
- More boilerplate: Integration layer adds ~60 lines
- Callback overhead: Coordination requires explicit callbacks
- Learning curve: New developers must understand hook composition

**Verdict**: Benefits outweigh costs. Separation enables scaling to more complex games and easier collaboration.
