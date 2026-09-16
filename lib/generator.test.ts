import { describe, it, expect } from "vitest"
import { calculateQualityScore } from "./generator"

describe("calculateQualityScore", () => {
  it("returns a number between 0 and 100 for an empty repo", () => {
    const { score } = calculateQualityScore({} as any)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("rewards detected facts", () => {
    const a = calculateQualityScore({ language: "TS" } as any).score
    const b = calculateQualityScore({} as any).score
    expect(a).toBeGreaterThan(b)
  })
})
