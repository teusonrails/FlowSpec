import type { FlowSpecValidationResult } from "@/lib/types/flowspec";

const REQUIRED_BLOCKS = [
  "@header",
  "@problem",
  "@flow",
  "@steps",
  "@datamap",
  "@integrations",
  "@implementation",
  "@errors",
  "@tests",
];

/**
 * Validate FlowSpec content against the specification.
 * Full implementation in Phase 4 — this is a basic stub that checks for required blocks.
 */
export function validateFlowSpec(content: string): FlowSpecValidationResult {
  const checks: FlowSpecValidationResult["checks"] = [];
  let score = 0;
  const maxScore = REQUIRED_BLOCKS.length * 10;

  for (const block of REQUIRED_BLOCKS) {
    const found = content.includes(block);
    checks.push({
      section: block,
      passed: found,
      message: found
        ? `${block} block found`
        : `Missing required ${block} block`,
      severity: found ? "info" : "error",
    });
    if (found) score += 10;
  }

  const normalizedScore = Math.round((score / maxScore) * 100);

  return {
    valid: normalizedScore >= 70,
    score: normalizedScore,
    checks,
  };
}
