import { describe, it, expect } from "vitest";
import {
  validatePillar,
  countAtoms,
  countCollections,
  countCrossRefs,
  PILLAR_REQUIREMENTS,
} from "@/lib/utils/pillar-validation";

describe("pillar-validation", () => {
  describe("countAtoms", () => {
    it("returns 0 for null/undefined", () => {
      expect(countAtoms(null)).toBe(0);
      expect(countAtoms(undefined)).toBe(0);
      expect(countAtoms({})).toBe(0);
    });

    it("counts non-empty primitives", () => {
      expect(countAtoms({ a: "x", b: 1, c: true })).toBe(3);
    });

    it("ignores empty strings, nulls, empty arrays", () => {
      expect(countAtoms({ a: "", b: null, c: [], d: "x" })).toBe(1);
    });

    it("trims strings before checking", () => {
      expect(countAtoms({ a: "   ", b: "x" })).toBe(1);
    });
  });

  describe("countCollections", () => {
    it("only counts arrays with >=2 items", () => {
      expect(countCollections({ a: [1], b: [1, 2], c: [1, 2, 3], d: "x" })).toBe(2);
    });
  });

  describe("countCrossRefs", () => {
    it("counts strings with known prefixes", () => {
      expect(countCrossRefs({ a: "strategy_xyz", b: "driver_abc", c: "regular text" })).toBe(2);
    });
  });

  describe("validatePillar", () => {
    it("EMPTY when no atoms", () => {
      const result = validatePillar("a", null, 0);
      expect(result.level).toBe("EMPTY");
      expect(result.projectedScore).toBe(0);
      expect(result.gaps.length).toBeGreaterThan(0);
    });

    it("STARTED with very few atoms", () => {
      const result = validatePillar("a", { vision: "test" }, 0.5);
      expect(result.level).toBe("STARTED");
      expect(result.atomsRatio).toBeLessThan(0.3);
    });

    it("PARTIAL with moderate atoms but no collections", () => {
      const content = {
        vision: "v", mission: "m", purpose: "p", origin: "o",
        founder_story: "f", values: "x",
      };
      const result = validatePillar("a", content, 0.5);
      expect(result.level).toBe("PARTIAL");
    });

    it("COHERENT when atoms and collections meet thresholds", () => {
      const content: Record<string, unknown> = {
        vision: "v", mission: "m", purpose: "p", origin: "o",
        founder_story: "f", values: ["c1", "c2"],
        manifesto: "ma", archetype: "ar",
        rituals: ["r1", "r2"], totem: "t",
        cultural_anchor: ["c1", "c2", "c3"],
      };
      const result = validatePillar("a", content, 0.5);
      expect(result.level).toBe("COHERENT");
      expect(result.projectedScore).toBeGreaterThan(15);
    });

    it("VALIDATED when all dimensions are strong with high confidence", () => {
      const content: Record<string, unknown> = {
        vision: "v", mission: "m", purpose: "p", origin: "o",
        founder_story: "f", values: ["c1", "c2"],
        manifesto: "ma", archetype: "ar",
        rituals: ["r1", "r2"], totem: "t",
        cultural_anchor: ["c1", "c2"],
        link_a: "strategy_abc",
        link_b: "driver_xyz",
      };
      const result = validatePillar("a", content, 0.8);
      expect(result.level).toBe("VALIDATED");
      expect(result.projectedScore).toBeGreaterThan(20);
    });

    it("projected score is bounded by 25", () => {
      const tons: Record<string, unknown> = {};
      for (let i = 0; i < 100; i++) tons[`atom_${i}`] = ["a", "b"];
      const result = validatePillar("v", tons, 1);
      expect(result.projectedScore).toBeLessThanOrEqual(25);
    });
  });

  describe("PILLAR_REQUIREMENTS", () => {
    it("has all 8 pillars", () => {
      expect(Object.keys(PILLAR_REQUIREMENTS).sort()).toEqual(["a", "d", "e", "i", "r", "s", "t", "v"]);
    });

    it("each has positive atomsRequired", () => {
      for (const req of Object.values(PILLAR_REQUIREMENTS)) {
        expect(req.atomsRequired).toBeGreaterThan(0);
        expect(req.keyAtoms.length).toBeGreaterThan(0);
      }
    });
  });
});
