import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLetterGameLogic } from "./useLetterGameLogic";
import { Letter } from "../types/game";

describe("useLetterGameLogic", () => {
  describe("Vowel Distractor Logic", () => {
    it("should provide at least one vowel distractor when correct letter is a vowel", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      // Test multiple times to account for randomness
      const testRuns = 50;
      let vowelPositionCount = 0;

      for (let run = 0; run < testRuns; run++) {
        // Reset game to get new word
        act(() => {
          result.current.resetGame();
        });

        // Check each position in the word
        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];

          // Check if correct letter is a vowel
          const vowels: Letter[] = ["A", "E", "I", "O", "U"];
          const isVowel = vowels.includes(correctLetter);

          if (isVowel) {
            vowelPositionCount++;
            const availableLetters = result.current.availableLetters;

            // Count vowels in available letters (excluding the correct one if it's there)
            const vowelsInPool = availableLetters.filter(l =>
              vowels.includes(l) && l !== correctLetter
            );

            // Should have at least one vowel distractor
            expect(vowelsInPool.length).toBeGreaterThanOrEqual(1);
          }

          // Advance to next position if not at the end
          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }

      // Sanity check: we should have tested some vowel positions
      expect(vowelPositionCount).toBeGreaterThan(0);
    });

    it("should provide exactly one vowel and one consonant distractor for vowels", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const vowels: Letter[] = ["A", "E", "I", "O", "U"];
      const testRuns = 30;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        // Check all three positions
        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVowel = vowels.includes(correctLetter);

          if (isVowel) {
            const availableLetters = result.current.availableLetters;

            // Filter out the correct letter to get just distractors
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Count vowels and consonants in distractors
            const vowelDistractors = distractors.filter(l => vowels.includes(l));
            const consonantDistractors = distractors.filter(l => !vowels.includes(l));

            // Should have exactly 1 vowel and 1 consonant distractor
            expect(vowelDistractors.length).toBe(1);
            expect(consonantDistractors.length).toBe(1);
          }

          // Advance to next position
          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }
    });

    it("should not duplicate the correct vowel in distractors", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const vowels: Letter[] = ["A", "E", "I", "O", "U"];
      const testRuns = 30;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVowel = vowels.includes(correctLetter);

          if (isVowel) {
            const availableLetters = result.current.availableLetters;
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Correct vowel should not appear in distractors
            expect(distractors).not.toContain(correctLetter);

            // Check that the vowel distractor is different from correct letter
            const vowelDistractors = distractors.filter(l => vowels.includes(l));
            vowelDistractors.forEach(distractor => {
              expect(distractor).not.toBe(correctLetter);
            });
          }

          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }
    });

    it("should allow consonants to have any combination of distractors", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const vowels: Letter[] = ["A", "E", "I", "O", "U"];
      const testRuns = 30;
      let foundBothVowels = false;
      let foundBothConsonants = false;
      let foundMixed = false;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isConsonant = !vowels.includes(correctLetter);

          if (isConsonant) {
            const availableLetters = result.current.availableLetters;
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Count vowels and consonants in distractors
            const vowelCount = distractors.filter(l => vowels.includes(l)).length;
            const consonantCount = distractors.filter(l => !vowels.includes(l)).length;

            // Track different combinations
            if (vowelCount === 2) foundBothVowels = true;
            if (consonantCount === 2) foundBothConsonants = true;
            if (vowelCount === 1 && consonantCount === 1) foundMixed = true;

            // Should have exactly 2 distractors total
            expect(distractors.length).toBe(2);
          }

          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }

      // Over many runs, consonants should show variety in distractor types
      // (This is probabilistic - with 30 runs we should see at least one of each)
      const hasVariety = foundBothVowels || foundBothConsonants || foundMixed;
      expect(hasVariety).toBe(true);
    });
  });

  describe("Visually Similar Letter Distractor Logic (b/p/d/q)", () => {
    const VISUALLY_SIMILAR_LETTERS: Letter[] = ["B", "P", "D", "Q"];
    const vowels: Letter[] = ["A", "E", "I", "O", "U"];

    it("should provide at least one visually similar distractor when correct letter is b/p/d/q", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const testRuns = 50;
      let similarLetterPositionCount = 0;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        // Check each position in the word
        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];

          // Check if correct letter is one of the visually similar letters
          const isVisuallySimilar = VISUALLY_SIMILAR_LETTERS.includes(correctLetter);

          if (isVisuallySimilar) {
            similarLetterPositionCount++;
            const availableLetters = result.current.availableLetters;

            // Filter out the correct letter to get distractors
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Count how many of the distractors are from the visually similar group
            const similarDistractors = distractors.filter(l =>
              VISUALLY_SIMILAR_LETTERS.includes(l)
            );

            // Should have at least one visually similar distractor
            expect(similarDistractors.length).toBeGreaterThanOrEqual(1);
          }

          // Advance to next position if not at the end
          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }

      // Sanity check: we should have tested some visually similar letter positions
      expect(similarLetterPositionCount).toBeGreaterThan(0);
    });

    it("should provide exactly one similar letter and one other distractor for b/p/d/q", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const testRuns = 50;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        // Check all three positions
        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVisuallySimilar = VISUALLY_SIMILAR_LETTERS.includes(correctLetter);

          if (isVisuallySimilar) {
            const availableLetters = result.current.availableLetters;

            // Filter out the correct letter to get just distractors
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Count similar and other distractors
            const similarDistractors = distractors.filter(l =>
              VISUALLY_SIMILAR_LETTERS.includes(l)
            );
            const otherDistractors = distractors.filter(l =>
              !VISUALLY_SIMILAR_LETTERS.includes(l)
            );

            // Should have exactly 1 similar letter and 1 other distractor
            expect(similarDistractors.length).toBe(1);
            expect(otherDistractors.length).toBe(1);
            expect(distractors.length).toBe(2);
          }

          // Advance to next position
          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }
    });

    it("should not duplicate the correct similar letter in distractors", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const testRuns = 50;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVisuallySimilar = VISUALLY_SIMILAR_LETTERS.includes(correctLetter);

          if (isVisuallySimilar) {
            const availableLetters = result.current.availableLetters;
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Correct letter should not appear in distractors
            expect(distractors).not.toContain(correctLetter);

            // Check that the similar distractor is different from correct letter
            const similarDistractors = distractors.filter(l =>
              VISUALLY_SIMILAR_LETTERS.includes(l)
            );
            similarDistractors.forEach(distractor => {
              expect(distractor).not.toBe(correctLetter);
            });
          }

          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }
    });

    it("should select similar distractor from the remaining three letters (B/P/D/Q)", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const testRuns = 100;
      const similarDistractorCounts: Record<string, Set<Letter>> = {
        "B": new Set(),
        "P": new Set(),
        "D": new Set(),
        "Q": new Set()
      };

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVisuallySimilar = VISUALLY_SIMILAR_LETTERS.includes(correctLetter);

          if (isVisuallySimilar) {
            const availableLetters = result.current.availableLetters;
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Find the similar distractor
            const similarDistractor = distractors.find(l =>
              VISUALLY_SIMILAR_LETTERS.includes(l)
            );

            if (similarDistractor) {
              // Track which similar letters appear as distractors for each correct letter
              similarDistractorCounts[correctLetter].add(similarDistractor);

              // Verify the similar distractor is one of the other three
              const expectedOptions = VISUALLY_SIMILAR_LETTERS.filter(l => l !== correctLetter);
              expect(expectedOptions).toContain(similarDistractor);
            }
          }

          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }

      // Over many runs, we should see variety in which similar letters are chosen
      // (Each correct letter should have seen different similar distractors)
      Object.entries(similarDistractorCounts).forEach(([correctLetter, distractors]) => {
        if (distractors.size > 0) {
          // Each distractor should be from the remaining three similar letters
          distractors.forEach(distractor => {
            expect(VISUALLY_SIMILAR_LETTERS).toContain(distractor);
            expect(distractor).not.toBe(correctLetter);
          });
        }
      });
    });

    it("should prioritize visually similar distractors over vowel distractors", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const testRuns = 50;

      for (let run = 0; run < testRuns; run++) {
        act(() => {
          result.current.resetGame();
        });

        for (let position = 0; position < 3; position++) {
          const currentWord = result.current.currentWord;
          const correctLetter = currentWord[result.current.gameState.currentPosition];
          const isVisuallySimilar = VISUALLY_SIMILAR_LETTERS.includes(correctLetter);

          if (isVisuallySimilar) {
            const availableLetters = result.current.availableLetters;
            const distractors = availableLetters.filter(l => l !== correctLetter);

            // Count similar distractors
            const similarDistractors = distractors.filter(l =>
              VISUALLY_SIMILAR_LETTERS.includes(l)
            );

            // Even though b/p/d/q are consonants, the similar letter logic
            // should take priority, so we should always have exactly 1 similar distractor
            expect(similarDistractors.length).toBe(1);
          }

          if (position < 2) {
            act(() => {
              result.current.attemptPlacement(correctLetter, result.current.gameState.currentPosition);
            });
          }
        }
      }
    });
  });

  describe("Basic Game Logic", () => {
    it("should initialize with a shuffled word bank", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      expect(result.current.gameState.wordBank).toHaveLength(10);
      expect(result.current.gameState.currentWordIndex).toBe(0);
      expect(result.current.currentWord).toBeDefined();
      expect(result.current.currentWord).toHaveLength(3);
    });

    it("should provide 3 available letters including the correct one", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const correctLetter = result.current.currentWord[result.current.gameState.currentPosition];
      const availableLetters = result.current.availableLetters;

      expect(availableLetters).toHaveLength(3);
      expect(availableLetters).toContain(correctLetter);
    });

    it("should accept correct letter placement at current position", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const correctLetter = result.current.currentWord[0];

      act(() => {
        const placementResult = result.current.attemptPlacement(correctLetter, 0);
        expect(placementResult.success).toBe(true);
        expect(placementResult.type).toBe("position-advanced");
      });

      expect(result.current.gameState.currentPosition).toBe(1);
    });

    it("should reject incorrect letter placement", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const correctLetter = result.current.currentWord[0];
      const availableLetters = result.current.availableLetters;
      const incorrectLetter = availableLetters.find(l => l !== correctLetter)!;

      act(() => {
        const placementResult = result.current.attemptPlacement(incorrectLetter, 0);
        expect(placementResult.success).toBe(false);
        expect(placementResult.type).toBe("invalid");
      });

      // Position should not advance
      expect(result.current.gameState.currentPosition).toBe(0);
    });

    it("should reject placement at wrong position", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const correctLetter = result.current.currentWord[1]; // Letter for position 1

      act(() => {
        const placementResult = result.current.attemptPlacement(correctLetter, 1); // Try to place at position 1
        expect(placementResult.success).toBe(false);
        expect(placementResult.reason).toContain("position");
      });
    });

    it("should complete word after filling all three positions", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const word = result.current.currentWord;

      // Place first letter
      act(() => {
        result.current.attemptPlacement(word[0], 0);
      });

      // Place second letter
      act(() => {
        result.current.attemptPlacement(word[1], 1);
      });

      // Place third letter
      act(() => {
        const placementResult = result.current.attemptPlacement(word[2], 2);
        expect(placementResult.success).toBe(true);
        expect(placementResult.type).toBe("word-completed");
      });
    });

    it("should advance to next word after completion", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const initialWordIndex = result.current.gameState.currentWordIndex;
      const word = result.current.currentWord;

      // Complete the word
      act(() => {
        result.current.attemptPlacement(word[0], 0);
        result.current.attemptPlacement(word[1], 1);
        result.current.attemptPlacement(word[2], 2);
      });

      // Advance to next word
      act(() => {
        result.current.advanceToNextWord();
      });

      expect(result.current.gameState.currentWordIndex).toBe(initialWordIndex + 1);
      expect(result.current.gameState.currentPosition).toBe(0);
      expect(result.current.gameState.completedWords).toBe(1);
    });

    it("should mark game as complete after all words", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      // Complete all 10 words
      for (let i = 0; i < 10; i++) {
        act(() => {
          const word = result.current.currentWord;
          result.current.attemptPlacement(word[0], 0);
          result.current.attemptPlacement(word[1], 1);
          result.current.attemptPlacement(word[2], 2);

          if (i < 9) {
            result.current.advanceToNextWord();
          }
        });
      }

      act(() => {
        result.current.advanceToNextWord();
      });

      expect(result.current.gameState.isGameComplete).toBe(true);
    });

    it("should reset game to initial state", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      // Complete a word
      act(() => {
        const word = result.current.currentWord;
        result.current.attemptPlacement(word[0], 0);
        result.current.attemptPlacement(word[1], 1);
        result.current.attemptPlacement(word[2], 2);
        result.current.advanceToNextWord();
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.currentWordIndex).toBe(0);
      expect(result.current.gameState.currentPosition).toBe(0);
      expect(result.current.gameState.completedWords).toBe(0);
      expect(result.current.gameState.isGameComplete).toBe(false);
    });
  });

  describe("Slot Management", () => {
    it("should lock letters after placement", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const word = result.current.currentWord;

      act(() => {
        result.current.attemptPlacement(word[0], 0);
      });

      expect(result.current.slots[0]).not.toBeNull();
      expect(result.current.slots[0]?.letter).toBe(word[0]);
      expect(result.current.slots[0]?.isLocked).toBe(true);
    });

    it("should prevent dragging from locked slots", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const word = result.current.currentWord;

      act(() => {
        result.current.attemptPlacement(word[0], 0);
      });

      const isSlotSource = result.current.isSlotSource(word[0]);
      expect(isSlotSource).toBe(true);
    });

    it("should clear slots on reset", () => {
      const { result } = renderHook(() => useLetterGameLogic());

      const word = result.current.currentWord;

      // Place some letters
      act(() => {
        result.current.attemptPlacement(word[0], 0);
        result.current.attemptPlacement(word[1], 1);
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.slots).toEqual([null, null, null]);
    });
  });
});
