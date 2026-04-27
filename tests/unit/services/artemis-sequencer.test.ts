import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks pour Prisma + knowledge-capture
const mockStrategy = vi.fn();
const mockPillarFindUnique = vi.fn();
const mockPillarUpsert = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    strategy: { findUnique: (...args: unknown[]) => mockStrategy(...args) },
    pillar: {
      findUnique: (...args: unknown[]) => mockPillarFindUnique(...args),
      upsert: (...args: unknown[]) => mockPillarUpsert(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

vi.mock("@/server/services/knowledge-capture", () => ({
  captureEvent: vi.fn().mockResolvedValue(undefined),
}));

import {
  planSequence,
  canComplete,
  updatePillarContent,
} from "@/server/services/artemis-sequencer";

describe("artemis-sequencer", () => {
  beforeEach(() => {
    mockStrategy.mockReset();
    mockPillarFindUnique.mockReset();
    mockPillarUpsert.mockReset();
    mockTransaction.mockReset();
  });

  describe("planSequence", () => {
    it("throws if strategy not found", async () => {
      mockStrategy.mockResolvedValue(null);
      await expect(planSequence("missing")).rejects.toThrow(/not found/);
    });

    it("returns 8 steps with default weights when no business context", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [],
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      expect(plan.steps).toHaveLength(8);
      expect(plan.hasBusinessContext).toBe(false);
      expect(plan.steps.every((s) => s.weight === 1)).toBe(true);
    });

    it("recommends pillar A first when nothing is filled", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [],
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      // A est le seul sans prerequis donc doit etre TO_DO
      const a = plan.steps.find((s) => s.pillar === "a");
      expect(a?.status).toBe("TO_DO");
      expect(plan.recommendedNextPillar).toBe("a");
    });

    it("blocks D until A is at least PARTIAL", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [], // A vide
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      const d = plan.steps.find((s) => s.pillar === "d");
      expect(d?.status).toBe("BLOCKED");
      expect(d?.blockingPillars).toContain("a");
    });

    it("unlocks D once A has enough atoms", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [
          {
            key: "a",
            content: {
              vision: "v", mission: "m", purpose: "p", origin: "o",
              founder_story: "f", values: "x",
            },
            confidence: 0.7,
          },
        ],
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      const d = plan.steps.find((s) => s.pillar === "d");
      expect(d?.status).not.toBe("BLOCKED");
      expect(d?.prerequisitesMet).toBe(true);
    });

    it("S is blocked when most pillars are empty", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [],
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      const s = plan.steps.find((step) => step.pillar === "s");
      expect(s?.status).toBe("BLOCKED");
    });

    it("applies business-model weights when context provided", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: {
          businessModel: "ABONNEMENT",
          economicModels: ["ABONNEMENT"],
          positioningArchetype: "MAINSTREAM",
          salesChannel: "DIRECT",
          positionalGoodFlag: false,
          premiumScope: "NONE",
        },
        pillars: [],
        advertis_vector: null,
      });
      const plan = await planSequence("s1");
      // Pour ABONNEMENT le pilier V doit avoir un poids > 1
      const v = plan.steps.find((s) => s.pillar === "v");
      expect(v?.weight).toBeGreaterThan(1);
      expect(plan.hasBusinessContext).toBe(true);
    });
  });

  describe("canComplete", () => {
    it("refuses when fewer than 3 pillars are started", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [{ key: "a", content: { vision: "v" }, confidence: 0.5 }],
        advertis_vector: null,
      });
      const guard = await canComplete("s1");
      expect(guard.allowed).toBe(false);
      expect(guard.reason).toMatch(/3 piliers/);
    });

    it("allows when at least 3 pillars are started", async () => {
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [
          { key: "a", content: { vision: "v" }, confidence: 0.5 },
          { key: "d", content: { positioning: "p" }, confidence: 0.5 },
          { key: "v", content: { promise: "p" }, confidence: 0.5 },
        ],
        advertis_vector: null,
      });
      const guard = await canComplete("s1");
      expect(guard.allowed).toBe(true);
    });
  });

  describe("updatePillarContent", () => {
    it("merges patch over existing content via transaction", async () => {
      let upsertedContent: Record<string, unknown> | null = null;
      mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          pillar: {
            findUnique: vi.fn().mockResolvedValue({
              content: { vision: "old", mission: "m" },
              confidence: 0.5,
            }),
            upsert: vi.fn().mockImplementation((args: { update: { content: Record<string, unknown> } }) => {
              upsertedContent = args.update.content;
              return Promise.resolve();
            }),
          },
        };
        return fn(tx);
      });

      // planSequence appel apres : on lui donne une strategy minimale
      mockStrategy.mockResolvedValue({
        id: "s1",
        name: "Test",
        businessContext: null,
        pillars: [{
          key: "a",
          content: { vision: "new vision", mission: "m" },
          confidence: 0.7,
        }],
        advertis_vector: null,
      });

      const result = await updatePillarContent(
        "s1",
        "a",
        { vision: "new vision" },
        0.7
      );
      expect(upsertedContent).toEqual({ vision: "new vision", mission: "m" });
      expect(result.step.pillar).toBe("a");
    });

    it("ignores empty string in patch (no overwrite)", async () => {
      let upsertedContent: Record<string, unknown> | null = null;
      mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          pillar: {
            findUnique: vi.fn().mockResolvedValue({
              content: { vision: "kept" },
              confidence: 0.5,
            }),
            upsert: vi.fn().mockImplementation((args: { update: { content: Record<string, unknown> } }) => {
              upsertedContent = args.update.content;
              return Promise.resolve();
            }),
          },
        };
        return fn(tx);
      });
      mockStrategy.mockResolvedValue({
        id: "s1", name: "Test", businessContext: null,
        pillars: [{ key: "a", content: { vision: "kept" }, confidence: 0.5 }],
        advertis_vector: null,
      });

      await updatePillarContent("s1", "a", { vision: "" });
      expect(upsertedContent).toEqual({ vision: "kept" });
    });
  });
});
