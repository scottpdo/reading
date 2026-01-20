# Claude Development Guide

## Project Overview

This is a CVC (consonant-vowel-consonant) word spelling game built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Players listen to audio prompts and drag letters to spell simple three-letter words in sequence. The game features full audio integration with word pronunciation, sound effects, and a collection of 120 phonetically-consistent CVC words.

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
- Selects 10 random words from master list of 120 words via `selectRandomWords()` function
- `availableLetters` stored in state to prevent re-randomization during React strict mode double-mount
- `useEffect` logs current word on word index change (for debugging)
- Fisher-Yates shuffle algorithm for true randomization
- Distractor letter generation ensures vowels get at least one vowel distractor for better learning

#### 2. Drag-and-Drop Mechanics Hook (`app/hooks/useDragAndDropMechanics.ts`)
**Responsibility**: Generic drag-and-drop interaction handling

**Key Functions**:
- `processDrop(letter)` - Consolidated drop logic for both mouse and touch
  - Checks `canDragFrom` callback
  - Calls `onDrop` callback with letter and active slot for validation
  - Clears drag state
- Mouse handlers: `handleDragStart`, `handleDragEnd`, `handleDropToAvailable`
- Container-level handlers: `handleContainerDragOver`, `handleContainerDragLeave`, `handleContainerDrop`
- Touch handlers: `handleTouchStart`, `handleTouchMove`, `handleTouchEnd`

**State Managed**:
- `draggingLetter` - which letter is being dragged
- `isDragOverContainer` - whether cursor is over the drop container (highlights active slot)
- `touchPosition` - x/y coordinates for floating letter on touch devices

**Props (Callbacks)**:
- `onDrop: (letter, slot) => { accepted: boolean }` - Validates drop attempts
- `canDragFrom: (letter) => boolean` - Prevents dragging locked letters
- `activeSlot: SlotIndex` - The currently active slot (always drops to this slot)

**Key Implementation Details**:
- Container-based dragging: entire slot area is one drop zone, always drops to active slot
- Mouse and touch logic consolidated via shared `processDrop` function
- Touch handling uses `document.elementFromPoint` for slot detection
- Reusable for other drag-and-drop games

#### 3. Integration Layer (`app/page.tsx`)
**Responsibility**: Coordinate hooks, manage UI feedback, and control audio playback

**Key Implementation**:
```typescript
const gameLogic = useLetterGameLogic();
const dragMechanics = useDragAndDropMechanics({
  onDrop: handleDropAttempt,
  canDragFrom: (letter) => !gameLogic.isSlotSource(letter),
  activeSlot: gameLogic.gameState.currentPosition
});
```

**Game State** (moved from hooks for better separation):
- `hasStarted` - whether game has been started (shows start screen if false)
- `isUppercase` - letter case toggle (uppercase/lowercase display)
- `isMounted` - hydration tracking to avoid SSR mismatch with audio elements
- `isIntroPlaying` - tracks intro audio playback (disables replay button during)

**UI Feedback State**:
- `showError` - which slot to animate red (500ms timeout)
- `showSuccess` - whether to show success modal (2s auto-advance)
- `errorTimeoutRef` / `successTimeoutRef` - cleanup on unmount/reset

**Audio Refs**:
- `introAudioRef` - "Now spell the word" audio
- `wordAudioRef` - Current word pronunciation (dynamically loaded)
- `chimeAudioRef` - Word completion success sound
- `fanfareAudioRef` - Game completion celebration
- `errorAudioRef` - Incorrect placement sound

**Bridge Function** (`handleDropAttempt`):
1. Calls `gameLogic.attemptPlacement(letter, slot)`
2. On error: plays error sound, sets `showError`, schedules clear timeout
3. On word complete: plays chime sound, sets `showSuccess`, schedules `advanceToNextWord`
4. Returns `{ accepted: boolean }` to drag mechanics

**Audio Sequence** (via useEffect):
1. Plays intro audio "Now spell the word"
2. Waits for intro to complete
3. Plays current word pronunciation
4. Repeats sequence when word index changes

## Game Flow

### Start Screen
1. Game loads with title "Spell the Words" and description
2. User clicks "Start Game" button to begin
3. Audio elements preload during start screen (prevents SSR mismatch)
4. Start screen includes audio preloading for smooth playback

### Word Progression
1. Game selects 10 random words from pool of 120 using Fisher-Yates shuffle
2. Plays audio sequence: "Now spell the word" → word pronunciation
3. Letter pool displays 3 letters: correct letter + 2 random distractors (shuffled)
4. Active slot (currentPosition) pulses blue to indicate where to place next letter
5. Player must fill slots sequentially: position 0 → 1 → 2
6. Replay button (🔊) allows replaying word audio (disabled during intro)
7. Case toggle button (Aa) switches between uppercase/lowercase display

### Validation Rules
- Letters can only be placed in the active position (currentPosition)
- Placed letters are locked and cannot be dragged
- Slot-to-slot dragging is prevented via `canDragFrom` check
- Only the correct letter is accepted for each position
- Container-based drop: entire slot area is a drop zone, always targets active slot

### Feedback Mechanisms
- **Correct placement**: Letter locks in slot, position advances, pool regenerates
- **Incorrect letter**: Error sound plays, slot flashes red with shake animation (500ms), letter returns to pool
- **Wrong position**: Same error feedback as incorrect letter
- **Word completion**: Chime sound plays, success modal appears, auto-advances after 2 seconds
- **Game completion**: Fanfare plays, win modal with "Play Again" button (reshuffles word bank)

## Component Structure

### Core Components
- `LetterPool` - Displays available letters in vertical stack
- `DropSlot` - Individual slot with visual states (active/highlighted/error/default)
- `DraggableLetter` - Reusable letter element with optional box styling and lock state
- `FloatingLetter` - Follows touch position for visual feedback
- `SuccessModal` - Word completion celebration
- `WinModal` - Game completion with restart
- `ReplayButton` - Audio replay control (speaker icon, disabled during intro)
- `CaseToggleButton` - Uppercase/lowercase toggle (Aa icon)

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
| draggingLetter, isDragOverContainer, touchPosition | Drag Mechanics | Interaction tracking |
| showError, showSuccess, timeouts | Integration Layer | UI feedback coordination |
| hasStarted, isUppercase, isMounted, isIntroPlaying | Integration Layer | Game lifecycle and UI state |
| Audio refs (intro, word, chime, fanfare, error) | Integration Layer | Audio playback control |

## Development Guidelines

### Adding New Words
Edit `CVC_WORDS` array in `app/data/cvcWords.ts`. Must be 3-letter tuples:
```typescript
["N", "E", "W"]  // Correct
["WORD"]         // Wrong - not a tuple
```

**Important**: When adding words, also add corresponding audio file to `/public/audio/words/[word].mp3` (lowercase filename). Words should use consistent phonetic pronunciation:
- 'a' as in 'cat'
- 'e' as in 'pen'
- 'i' as in 'pig'
- 'o' as in 'dog'
- 'u' as in 'sun'

### Modifying Validation Rules
Edit `attemptPlacement` function in `useLetterGameLogic.ts`. Return `PlacementResult` with appropriate type and reason.

### Reusing Drag Mechanics
The `useDragAndDropMechanics` hook is game-agnostic. Just provide:
- `onDrop` callback for validation
- `canDragFrom` callback for source restrictions
- `activeSlot` to specify which slot should receive drops

Example for different game:
```typescript
const dragMechanics = useDragAndDropMechanics({
  onDrop: (item, target) => {
    // Your game logic here
    return { accepted: isValidMove(item, target) };
  },
  canDragFrom: (item) => !isLocked(item),
  activeSlot: currentTargetIndex
});
```

### Testing Strategy
- **Game logic tests**: Test validation, progression, and word management in isolation
- **Drag mechanics tests**: Test drag state, callbacks, and event handling
- **Integration tests**: Test coordination, UI feedback timing, and error handling

## Audio System

### Implementation
The game features a complete audio system with:
- **Word pronunciation**: Each CVC word has audio file at `/public/audio/words/[word].mp3`
- **Intro prompt**: "Now spell the word" audio plays before each word
- **Sound effects**: Chime (word complete), fanfare (game complete), error (wrong placement)
- **Replay functionality**: Users can replay word audio via replay button (disabled during intro)

### Audio Sequence
1. User starts game or advances to new word
2. Intro audio plays: "Now spell the word"
3. After intro completes, word audio plays
4. User can replay word audio at any time (unless intro is playing)
5. Success sounds play on word/game completion

### Audio API Routes
- `/api/audio/list` - Lists all available audio files
- `/api/audio/regenerate` - Regenerates audio for specific words
- `/api/audio/delete` - Deletes audio files

### Audio Check Page
- `/audio-check` - Diagnostic page for testing audio playback

## Known Issues & Future Work

### Current Limitations
- Test files need updating for refactored hooks (DropSlot.test.tsx has prop errors)
- No persistent progress or scoring
- Case toggle applies globally (can't have mixed case in same view)

### Planned Enhancements
1. **Difficulty levels**: Easy/medium/hard word banks with different phonetic patterns
2. **Progress tracking**: Save completed words, track statistics, show performance graphs
3. **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
4. **Animations**: Smoother letter transitions, celebration effects
5. **Audio improvements**: Background music toggle, volume controls
6. **Educational features**: Show images for words, phonics hints, parent/teacher dashboard

## Performance Notes

### Optimization Decisions
1. **availableLetters as state** (not computed): Prevents re-randomization during strict mode double-mount
2. **Lazy state initialization**: Word bank shuffled only once per component lifecycle
3. **useEffect for logging**: Only runs on word index change, not every render
4. **Consolidated drop logic**: Single `processDrop` function prevents duplicate code execution
5. **Audio preloading**: Audio elements created on start screen with `preload="auto"` for instant playback
6. **Hydration safety**: Audio elements only rendered after `isMounted` to prevent SSR mismatch

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
│   ├── useLetterGameLogic.ts      # Game state and rules (~235 lines)
│   ├── useDragAndDropMechanics.ts # Drag interaction (~129 lines)
│   └── useLetterGameLogic.test.ts # Game logic tests
├── components/
│   ├── LetterPool.tsx             # Available letters container
│   ├── DropSlot.tsx               # Individual placement target
│   ├── DraggableLetter.tsx        # Reusable letter element
│   ├── FloatingLetter.tsx         # Touch drag preview
│   ├── SuccessModal.tsx           # Word completion feedback
│   ├── WinModal.tsx               # Game completion screen
│   ├── ReplayButton.tsx           # Audio replay control
│   ├── CaseToggleButton.tsx       # Uppercase/lowercase toggle
│   └── *.test.tsx                 # Component tests
├── data/
│   └── cvcWords.ts                # Master word bank (120 words)
├── types/
│   └── game.ts                    # TypeScript type definitions
├── api/
│   └── audio/
│       ├── list/route.ts          # List audio files
│       ├── regenerate/route.ts    # Regenerate audio
│       └── delete/route.ts        # Delete audio files
├── audio-check/
│   └── page.tsx                   # Audio diagnostic page
├── page.tsx                       # Main app with integration layer (~328 lines)
├── page.test.tsx                  # Integration tests
├── layout.tsx                     # Root layout with metadata
└── globals.css                    # Animations and responsive styles

public/
└── audio/
    ├── words/                     # Word pronunciation MP3s
    │   ├── cat.mp3
    │   ├── dog.mp3
    │   ├── now-spell-the-word.mp3
    │   └── ...
    └── effects/                   # Sound effect MP3s
        ├── chime.mp3
        ├── fanfare.mp3
        └── error.mp3
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
- Audio errors logged if files missing or playback fails

### Common Issues
1. **Letters reshuffling on mount**: Check availableLetters is in state, not computed
2. **Validation not working**: Verify currentPosition matches targetSlot in attemptPlacement
3. **Timeouts not clearing**: Ensure refs are cleared in both error path and reset
4. **Drag not working**: Check canDragFrom callback isn't blocking source
5. **Modal not appearing**: Verify showSuccess/showError state in integration layer
6. **Audio not playing**: Check audio files exist in `/public/audio/`, verify browser autoplay policy
7. **Hydration errors**: Ensure audio elements only render after `isMounted` is true
8. **Replay button stuck disabled**: Check isIntroPlaying state clears properly after intro audio ends

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
- More boilerplate: Integration layer adds ~328 lines (includes audio, start screen, controls)
- Callback overhead: Coordination requires explicit callbacks
- Learning curve: New developers must understand hook composition

**Verdict**: Benefits outweigh costs. Separation enables scaling to more complex games and easier collaboration. Integration layer handles all cross-cutting concerns (audio, UI feedback, game lifecycle) while keeping core hooks focused and reusable.
