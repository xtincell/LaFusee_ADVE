/**
 * LLM Utilities — Shared helpers for all LLM interactions
 *
 * Chantier 10 — Fiabilité :
 *   - extractJSON : robust 3-step parser for LLM responses
 *   - callLLMWithRetry : exponential backoff retry wrapper
 *
 * LOI 9 : seul Mestor (Commandant) décide. Ces utils sont des
 * helpers techniques, pas des décideurs.
 */

// ── extractJSON — Robust 3-step parser ────────────────────────────────

/**
 * Extract JSON from an LLM response. Handles 3 cases:
 *   1. Pure JSON (no markdown)
 *   2. JSON inside ```json ... ``` markdown block
 *   3. JSON embedded in text (balanced braces)
 *
 * Throws if no valid JSON found.
 */
export function extractJSON(text: string): Record<string, unknown> | unknown[] {
  const trimmed = text.trim();

  // Step 1: Try direct parse (LLM returned pure JSON)
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // Not pure JSON — continue
  }

  // Step 2: Try markdown code block extraction
  const mdMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch?.[1]) {
    try {
      const parsed = JSON.parse(mdMatch[1].trim());
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch {
      // Invalid JSON in markdown block — continue
    }
  }

  // Step 3: Find first balanced { ... } or [ ... ] in the text
  const balanced = findBalancedJSON(trimmed);
  if (balanced) {
    try {
      const parsed = JSON.parse(balanced);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch {
      // Balanced braces but invalid JSON — continue
    }
  }

  throw new Error(
    `extractJSON: impossible de parser la réponse LLM (${trimmed.length} chars). ` +
    `Début: "${trimmed.slice(0, 100)}..."`
  );
}

/**
 * Find the first balanced JSON structure in text.
 * Handles nested braces/brackets correctly.
 */
function findBalancedJSON(text: string): string | null {
  const startObj = text.indexOf("{");
  const startArr = text.indexOf("[");

  // Pick the earliest start
  let start: number;
  let openChar: string;
  let closeChar: string;

  if (startObj >= 0 && (startArr < 0 || startObj < startArr)) {
    start = startObj;
    openChar = "{";
    closeChar = "}";
  } else if (startArr >= 0) {
    start = startArr;
    openChar = "[";
    closeChar = "]";
  } else {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i]!;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === openChar) depth++;
    if (char === closeChar) depth--;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null; // Unbalanced
}

// ── callLLMWithRetry — Exponential backoff ────────────────────────────

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Call an async function with exponential backoff retry.
 * Default: 2 retries, 1s base delay, 10s max delay.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 1000, maxDelayMs = 10000 } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ── Type-safe LLM call wrapper ────────────────────────────────────────

interface LLMCallOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  strategyId?: string;
}

/**
 * Call Claude with retry + cost tracking + extractJSON.
 * Returns parsed JSON from the LLM response.
 */
export async function callLLMAndParse(
  options: LLMCallOptions,
  context: string = "unknown",
): Promise<Record<string, unknown>> {
  const { anthropic } = await import("@ai-sdk/anthropic");
  const { generateText } = await import("ai");
  const { db } = await import("@/lib/db");

  const result = await withRetry(async () => {
    const { text, usage } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: options.system,
      prompt: options.prompt,
      maxTokens: options.maxTokens ?? 6000,
    });

    // Cost tracking (non-blocking)
    if (options.strategyId) {
      db.aICostLog.create({
        data: {
          strategyId: options.strategyId,
          provider: "anthropic",
          model: "claude-sonnet-4-20250514",
          inputTokens: usage?.promptTokens ?? 0,
          outputTokens: usage?.completionTokens ?? 0,
          cost: ((usage?.promptTokens ?? 0) * 0.003 + (usage?.completionTokens ?? 0) * 0.015) / 1000,
          context,
        },
      }).catch(() => {});
    }

    return text;
  });

  return extractJSON(result) as Record<string, unknown>;
}
