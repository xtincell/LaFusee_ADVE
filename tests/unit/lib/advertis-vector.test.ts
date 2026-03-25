import { describe, it, expect } from "vitest";
import {
  classifyBrand,
  createEmptyVector,
  sumPillars,
  validateVector,
  AdvertisVectorSchema,
} from "@/lib/types/advertis-vector";

describe("AdvertisVector", () => {
  it("should create an empty vector with all zeros", () => {
    const vec = createEmptyVector();
    expect(vec.composite).toBe(0);
    expect(vec.confidence).toBe(0);
    expect(sumPillars(vec)).toBe(0);
  });

  it("should validate a correct vector", () => {
    const vec = { a: 20, d: 18, v: 15, e: 12, r: 10, t: 8, i: 5, s: 3, composite: 91, confidence: 0.85 };
    expect(validateVector(vec)).toBe(true);
  });

  it("should reject a vector with mismatched composite", () => {
    const vec = { a: 20, d: 18, v: 15, e: 12, r: 10, t: 8, i: 5, s: 3, composite: 100, confidence: 0.85 };
    expect(validateVector(vec)).toBe(false);
  });

  it("should reject out-of-range values", () => {
    const result = AdvertisVectorSchema.safeParse({
      a: 30, d: 0, v: 0, e: 0, r: 0, t: 0, i: 0, s: 0, composite: 30, confidence: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("classifyBrand", () => {
  it("should classify brands correctly", () => {
    expect(classifyBrand(50)).toBe("ZOMBIE");
    expect(classifyBrand(80)).toBe("ZOMBIE");
    expect(classifyBrand(81)).toBe("ORDINAIRE");
    expect(classifyBrand(120)).toBe("ORDINAIRE");
    expect(classifyBrand(121)).toBe("FORTE");
    expect(classifyBrand(160)).toBe("FORTE");
    expect(classifyBrand(161)).toBe("CULTE");
    expect(classifyBrand(180)).toBe("CULTE");
    expect(classifyBrand(181)).toBe("ICONE");
    expect(classifyBrand(200)).toBe("ICONE");
  });
});
