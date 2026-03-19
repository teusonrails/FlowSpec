import type {
  FlowSpecValidationResult,
  FlowSpecValidationCheck,
  FlowSpecSeverity,
} from "@/lib/types/flowspec";

// ─────────────────────────────────────────────────────────────
// FlowSpec Validator v1.0.0
// Validates FlowSpec content against the specification.
// ─────────────────────────────────────────────────────────────

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
] as const;

const CONDITIONAL_BLOCKS = ["@ai_layer"] as const;

const VALID_STEP_TYPES = [
  "TRIGGER",
  "INPUT",
  "TRANSFORM",
  "AI_PROCESS",
  "DECISION",
  "ACTION",
  "OUTPUT",
  "WAIT",
  "LOOP",
  "AGGREGATE",
  "FORK",
  "JOIN",
  "ERROR_HANDLER",
  "SUBFLOW",
] as const;

const VALID_SEVERITIES = ["info", "warning", "error", "critical"] as const;

/**
 * Validate FlowSpec content against the specification.
 * Returns a detailed validation result with per-check granularity.
 */
export function validateFlowSpec(content: string): FlowSpecValidationResult {
  const checks: FlowSpecValidationCheck[] = [];
  const blockPresence: Record<string, boolean> = {};
  const crossReferenceErrors: string[] = [];

  // ── Block Presence ──────────────────────────────────────
  for (const block of REQUIRED_BLOCKS) {
    const found = content.includes(block);
    blockPresence[block] = found;
    checks.push({
      section: block,
      passed: found,
      message: found
        ? `${block} block found`
        : `Missing required ${block} block`,
      severity: found ? "info" : "error",
    });
  }

  // Check @ai_layer conditionally (required if AI_PROCESS steps exist)
  const hasAIProcessSteps = content.includes("AI_PROCESS");
  const hasAILayer = content.includes("@ai_layer");
  blockPresence["@ai_layer"] = hasAILayer;

  if (hasAIProcessSteps && !hasAILayer) {
    checks.push({
      section: "@ai_layer",
      passed: false,
      message:
        "AI_PROCESS steps found but @ai_layer block is missing. Required when automation uses AI.",
      severity: "error",
    });
  } else if (hasAILayer) {
    checks.push({
      section: "@ai_layer",
      passed: true,
      message: "@ai_layer block found",
      severity: "info",
    });
  }

  // ── Step Validation ─────────────────────────────────────
  const stepPattern = /STEP-(\d+)\s*\{/g;
  const stepIds = new Set<string>();
  let match;
  while ((match = stepPattern.exec(content)) !== null) {
    stepIds.add(`STEP-${match[1]}`);
  }

  const stepCount = stepIds.size;
  checks.push({
    section: "@steps",
    passed: stepCount > 0,
    message:
      stepCount > 0
        ? `Found ${stepCount} step definitions`
        : "No step definitions found (expected STEP-XX { ... } pattern)",
    severity: stepCount > 0 ? "info" : "error",
  });

  // Check step types are valid
  const typePattern = /#type\s*<enum>:\s*(\w+)/g;
  while ((match = typePattern.exec(content)) !== null) {
    const stepType = match[1];
    const isValid = (VALID_STEP_TYPES as readonly string[]).includes(stepType);
    if (!isValid) {
      checks.push({
        section: "@steps",
        passed: false,
        message: `Invalid step type: "${stepType}". Valid types: ${VALID_STEP_TYPES.join(", ")}`,
        severity: "error",
      });
    }
  }

  // ── Required Step Fields ────────────────────────────────
  const stepBlocks = extractStepBlocks(content);
  for (const [stepId, block] of stepBlocks) {
    const hasName = block.includes("#name");
    const hasType = block.includes("#type");
    const hasDescription = block.includes("#description");

    if (!hasName) {
      checks.push({
        section: `@steps.${stepId}`,
        passed: false,
        message: `${stepId} is missing required #name field`,
        severity: "warning",
      });
    }
    if (!hasType) {
      checks.push({
        section: `@steps.${stepId}`,
        passed: false,
        message: `${stepId} is missing required #type field`,
        severity: "warning",
      });
    }
    if (!hasDescription) {
      checks.push({
        section: `@steps.${stepId}`,
        passed: false,
        message: `${stepId} is missing required #description field`,
        severity: "warning",
      });
    }
  }

  // ── Error Catalog Validation ────────────────────────────
  const errorPattern = /\b(E-\d{3})\s*\{/g;
  const errorIds = new Set<string>();
  while ((match = errorPattern.exec(content)) !== null) {
    errorIds.add(match[1]);
  }

  const errorCount = errorIds.size;
  checks.push({
    section: "@errors",
    passed: errorCount > 0,
    message:
      errorCount > 0
        ? `Found ${errorCount} error definitions`
        : "No error definitions found (expected E-XXX { ... } pattern)",
    severity: errorCount > 0 ? "info" : "warning",
  });

  // Check error severity values
  const severityPattern =
    /#severity\s*<enum:[^>]+>:\s*(info|warning|error|critical)/g;
  let severityCount = 0;
  while ((match = severityPattern.exec(content)) !== null) {
    severityCount++;
  }

  // ── Test Validation ─────────────────────────────────────
  const testPattern = /\b(TEST-\d+|TEST-STRESS-\d+)\s*\{/g;
  const testIds = new Set<string>();
  while ((match = testPattern.exec(content)) !== null) {
    testIds.add(match[1]);
  }

  const testCount = testIds.size;
  checks.push({
    section: "@tests",
    passed: testCount > 0,
    message:
      testCount > 0
        ? `Found ${testCount} test definitions`
        : "No test definitions found",
    severity: testCount > 0 ? "info" : "warning",
  });

  // Check for pass_criteria in tests
  if (testCount > 0) {
    const hasCriteria = content.includes("#pass_criteria");
    checks.push({
      section: "@tests",
      passed: hasCriteria,
      message: hasCriteria
        ? "Tests include pass criteria"
        : "Tests should include #pass_criteria with concrete expected values",
      severity: hasCriteria ? "info" : "warning",
    });
  }

  // ── Cross-Reference Validation ──────────────────────────
  const refPattern = /-> @(steps|errors|datamap|ai_layer)\.([\w-]+)/g;
  while ((match = refPattern.exec(content)) !== null) {
    const refBlock = match[1];
    const refTarget = match[2];

    let resolved = false;
    if (refBlock === "steps") {
      resolved = stepIds.has(refTarget);
    } else if (refBlock === "errors") {
      resolved = errorIds.has(refTarget);
    } else if (refBlock === "datamap") {
      resolved = content.includes(`${refTarget} {`);
    } else if (refBlock === "ai_layer") {
      resolved = content.includes(`${refTarget} {`);
    }

    if (!resolved) {
      const error = `Unresolved reference: @${refBlock}.${refTarget}`;
      crossReferenceErrors.push(error);
      checks.push({
        section: "cross-references",
        passed: false,
        message: error,
        severity: "warning",
      });
    }
  }

  if (crossReferenceErrors.length === 0) {
    checks.push({
      section: "cross-references",
      passed: true,
      message: "All cross-references resolve",
      severity: "info",
    });
  }

  // ── Datamap Validation ──────────────────────────────────
  const hasConfig = content.includes("CONFIG {");
  if (blockPresence["@datamap"]) {
    checks.push({
      section: "@datamap",
      passed: hasConfig,
      message: hasConfig
        ? "CONFIG block found in @datamap"
        : "Missing CONFIG block in @datamap — user-configurable variables should be defined",
      severity: hasConfig ? "info" : "warning",
    });
  }

  // ── AI Layer Validation ─────────────────────────────────
  if (hasAILayer) {
    const hasSystemPrompt = content.includes("#system_prompt");
    const hasUserPrompt = content.includes("#user_prompt_template");
    const hasModel = content.includes("#model {");
    const hasParameters = content.includes("#parameters {");

    checks.push({
      section: "@ai_layer",
      passed: hasSystemPrompt,
      message: hasSystemPrompt
        ? "System prompt found"
        : "Missing #system_prompt in @ai_layer — every AI config needs a production-ready prompt",
      severity: hasSystemPrompt ? "info" : "error",
    });

    checks.push({
      section: "@ai_layer",
      passed: hasUserPrompt,
      message: hasUserPrompt
        ? "User prompt template found"
        : "Missing #user_prompt_template in @ai_layer",
      severity: hasUserPrompt ? "info" : "warning",
    });

    checks.push({
      section: "@ai_layer",
      passed: hasModel,
      message: hasModel
        ? "Model configuration found"
        : "Missing #model configuration in @ai_layer",
      severity: hasModel ? "info" : "error",
    });

    // Check for response parsing strategy
    const hasResponseParsing = content.includes("#response_parsing");
    checks.push({
      section: "@ai_layer",
      passed: hasResponseParsing,
      message: hasResponseParsing
        ? "Response parsing strategy found"
        : "Missing #response_parsing — document how to extract structured data from AI output",
      severity: hasResponseParsing ? "info" : "warning",
    });
  }

  // ── Implementation Validation ───────────────────────────
  const implPattern = /IMPL-(\d+)\s*\{/g;
  const implCount = new Set<string>();
  while ((match = implPattern.exec(content)) !== null) {
    implCount.add(match[1]);
  }

  if (blockPresence["@implementation"]) {
    const hasVerify = content.includes("#verify");
    checks.push({
      section: "@implementation",
      passed: hasVerify,
      message: hasVerify
        ? "Implementation steps include verification"
        : 'Implementation steps should include #verify conditions ("You should see X")',
      severity: hasVerify ? "info" : "warning",
    });
  }

  // ── Diagram Validation ──────────────────────────────────
  if (blockPresence["@flow"]) {
    const hasDiagram = content.includes("#diagram");
    const hasTrigger =
      content.includes("TRIGGER(") || content.includes("TRIGGER (");

    checks.push({
      section: "@flow",
      passed: hasDiagram,
      message: hasDiagram
        ? "Flow diagram found"
        : "Missing #diagram in @flow — include a visual flow diagram",
      severity: hasDiagram ? "info" : "warning",
    });

    if (hasDiagram) {
      checks.push({
        section: "@flow",
        passed: hasTrigger,
        message: hasTrigger
          ? "Diagram includes TRIGGER entry point"
          : "Diagram should start with TRIGGER(label)",
        severity: hasTrigger ? "info" : "warning",
      });
    }
  }

  // ── Calculate Score ─────────────────────────────────────
  const score = calculateScore(checks);

  return {
    valid: score >= 70,
    score,
    checks,
    blockPresence,
    stepCount,
    errorCount,
    testCount,
    hasAILayer,
    crossReferenceErrors,
  };
}

/**
 * Extract step blocks from FlowSpec content.
 * Returns a map of step ID -> block content.
 */
function extractStepBlocks(content: string): Map<string, string> {
  const blocks = new Map<string, string>();
  const pattern = /(STEP-\d+)\s*\{/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const stepId = match[1];
    const startIdx = match.index;

    // Find matching closing brace (simple depth tracking)
    let depth = 0;
    let endIdx = startIdx;
    for (let i = match.index + match[0].length - 1; i < content.length; i++) {
      if (content[i] === "{") depth++;
      if (content[i] === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    blocks.set(stepId, content.substring(startIdx, endIdx));
  }

  return blocks;
}

/**
 * Calculate a normalized score (0-100) from validation checks.
 * Weights: errors = 10pts, warnings = 3pts, info (passed) = 1pt bonus
 */
function calculateScore(checks: FlowSpecValidationCheck[]): number {
  const totalChecks = checks.length;
  if (totalChecks === 0) return 0;

  let deductions = 0;
  let maxDeductions = 0;

  for (const check of checks) {
    if (!check.passed) {
      switch (check.severity) {
        case "error":
          deductions += 10;
          break;
        case "critical":
          deductions += 15;
          break;
        case "warning":
          deductions += 3;
          break;
        case "info":
          deductions += 1;
          break;
      }
    }
    // Max possible deductions based on severity
    switch (check.severity) {
      case "error":
        maxDeductions += 10;
        break;
      case "critical":
        maxDeductions += 15;
        break;
      case "warning":
        maxDeductions += 3;
        break;
      case "info":
        maxDeductions += 1;
        break;
    }
  }

  if (maxDeductions === 0) return 100;
  const score = Math.round(
    ((maxDeductions - deductions) / maxDeductions) * 100
  );
  return Math.max(0, Math.min(100, score));
}

/**
 * Quick check: does the content look like a valid FlowSpec document?
 * Returns true if it has the FLOWSPEC header and at least 5 required blocks.
 */
export function isFlowSpec(content: string): boolean {
  if (!content || content.length < 100) return false;
  const hasHeader = /FLOWSPEC\s+\d+\.\d+\.\d+/.test(content);
  const blockCount = REQUIRED_BLOCKS.filter((b) =>
    content.includes(b)
  ).length;
  return hasHeader && blockCount >= 5;
}

/**
 * Extract the FlowSpec version from content.
 */
export function extractVersion(content: string): string | null {
  const match = content.match(/FLOWSPEC\s+(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract the automation name from @header.
 */
export function extractName(content: string): string | null {
  const match = content.match(/#name\s*<str>:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Extract the domain from @header.classification.
 */
export function extractDomain(content: string): string | null {
  const match = content.match(
    /domain\s*<enum[^>]*>:\s*(\w+)/
  );
  return match ? match[1] : null;
}

/**
 * Extract the complexity from @header.classification.
 */
export function extractComplexity(
  content: string
): "basic" | "intermediate" | "advanced" | null {
  const match = content.match(
    /complexity\s*<enum[^>]*>:\s*(basic|intermediate|advanced)/
  );
  return match ? (match[1] as "basic" | "intermediate" | "advanced") : null;
}

/**
 * Count the number of AI_PROCESS steps.
 */
export function countAISteps(content: string): number {
  const matches = content.match(/#type\s*<enum>:\s*AI_PROCESS/g);
  return matches ? matches.length : 0;
}

/**
 * Extract all step IDs from the document.
 */
export function extractStepIds(content: string): string[] {
  const ids: string[] = [];
  const pattern = /(STEP-\d+)\s*\{/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    if (!ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}

/**
 * Extract all error IDs from the document.
 */
export function extractErrorIds(content: string): string[] {
  const ids: string[] = [];
  const pattern = /\b(E-\d{3})\s*\{/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    if (!ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}
