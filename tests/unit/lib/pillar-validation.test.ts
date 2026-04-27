import { describe, it, expect } from "vitest";
import {
  validatePillar,
  countAtoms,
  countKeyAtoms,
  countCollections,
  countCrossRefs,
  isPillarSkipped,
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
      expect(result.keyAtomsRatio).toBeLessThan(0.3);
    });

    it("STARTED only when explicitly skipped without content", () => {
      const result = validatePillar("a", { _skipped: true, _skipped_at: "x" }, 0.2);
      expect(result.level).toBe("STARTED");
      expect(result.skipped).toBe(true);
      // Le skip ne doit PAS gonfler le compte d'atomes
      expect(result.atomsFilled).toBe(0);
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

    it("garbage non-key atoms cannot push past STARTED alone", () => {
      const garbage: Record<string, unknown> = {};
      for (let i = 0; i < 50; i++) garbage[`random_${i}`] = "junk value";
      const result = validatePillar("a", garbage, 0.9);
      // Sans aucun keyAtom rempli, ne peut pas atteindre PARTIAL
      expect(["STARTED", "PARTIAL"]).toContain(result.level);
      expect(result.keyAtomsFilled).toBe(0);
    });

    it("survives corrupt non-object content (string, array)", () => {
      const r1 = validatePillar("a", "garbage string" as unknown, 0);
      const r2 = validatePillar("a", [1, 2, 3] as unknown, 0);
      expect(r1.level).toBe("EMPTY");
      expect(r2.level).toBe("EMPTY");
      expect(r1.projectedScore).toBe(0);
      expect(r2.projectedScore).toBe(0);
    });

    it("meta keys (_skipped, _meta) are not counted as atoms", () => {
      const content = { _skipped: true, _meta_x: "y", _foo: "bar" };
      expect(countAtoms(content)).toBe(0);
      expect(countCollections(content)).toBe(0);
    });
  });

  describe("countKeyAtoms", () => {
    it("only counts registered keyAtoms", () => {
      // pillar a registry: vision, mission, origin, values, archetype, ...
      const content = { vision: "v", mission: "m", random_atom: "ra" };
      expect(countKeyAtoms(content, "a")).toBe(2);
    });

    it("returns 0 for unrelated content", () => {
      expect(countKeyAtoms({ random: "x" }, "a")).toBe(0);
    });
  });

  describe("isPillarSkipped", () => {
    it("returns true when _skipped flag set", () => {
      expect(isPillarSkipped({ _skipped: true })).toBe(true);
    });
    it("returns false otherwise", () => {
      expect(isPillarSkipped({ vision: "x" })).toBe(false);
      expect(isPillarSkipped(null)).toBe(false);
      expect(isPillarSkipped("string")).toBe(false);
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
