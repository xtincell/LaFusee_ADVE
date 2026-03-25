import { describe, it, expect } from "vitest";
import { getAdaptiveQuestions, getAllQuestions } from "@/server/services/quick-intake/question-bank";

describe("Quick Intake Question Bank", () => {
  const pillars = ["a", "d", "v", "e", "r", "t", "i", "s"] as const;

  it("returns questions for each pillar", () => {
    for (const pillar of pillars) {
      const questions = getAdaptiveQuestions(pillar, {});
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each question has required fields", () => {
    for (const pillar of pillars) {
      const questions = getAdaptiveQuestions(pillar, {});
      for (const q of questions) {
        expect(q).toHaveProperty("id");
        expect(q).toHaveProperty("question");
        expect(typeof q.question).toBe("string");
        expect(q.question.length).toBeGreaterThan(10);
      }
    }
  });

  it("all pillars have unique question IDs", () => {
    const allIds = new Set<string>();
    for (const pillar of pillars) {
      const questions = getAdaptiveQuestions(pillar, {});
      for (const q of questions) {
        expect(allIds.has(q.id)).toBe(false);
        allIds.add(q.id);
      }
    }
  });

  it("getAllQuestions returns all pillars", () => {
    const all = getAllQuestions();
    for (const pillar of pillars) {
      expect(all[pillar]).toBeDefined();
      expect(all[pillar]!.length).toBeGreaterThanOrEqual(3);
    }
  });
});
