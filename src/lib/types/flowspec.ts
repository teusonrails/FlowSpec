// ─────────────────────────────────────────────────────────────
// FlowSpec Type Definitions
// Complete type system for FlowSpec v1.0.0 specification
// ─────────────────────────────────────────────────────────────

/** Step types supported by the FlowSpec specification */
export type FlowSpecStepType =
  | "TRIGGER"
  | "INPUT"
  | "TRANSFORM"
  | "AI_PROCESS"
  | "DECISION"
  | "ACTION"
  | "OUTPUT"
  | "WAIT"
  | "LOOP"
  | "AGGREGATE"
  | "FORK"
  | "JOIN"
  | "ERROR_HANDLER"
  | "SUBFLOW";

/** Step type codes (abbreviated) */
export type FlowSpecStepCode =
  | "TRG"
  | "INP"
  | "TRN"
  | "AIP"
  | "DEC"
  | "ACT"
  | "OUT"
  | "WAI"
  | "LOP"
  | "AGG"
  | "FRK"
  | "JON"
  | "ERH"
  | "SUB";

/** Error severity levels */
export type FlowSpecSeverity = "info" | "warning" | "error" | "critical";

/** Automation complexity tiers */
export type FlowSpecComplexity = "basic" | "intermediate" | "advanced";

/** Test types */
export type FlowSpecTestType =
  | "smoke"
  | "functional"
  | "edge_case"
  | "stress"
  | "regression";

/** Test priority */
export type FlowSpecTestPriority = "P0" | "P1" | "P2";

// ─────────────────────────────────────────────────────────────
// Block Types
// ─────────────────────────────────────────────────────────────

export interface FlowSpecHeader {
  name: string;
  slug?: string;
  version: string;
  flowspec: string;
  author: string;
  contact?: string;
  license?: string;
  created?: string;
  updated?: string;
  classification: {
    domain: string;
    platform: string | string[];
    aiModels?: string[];
    complexity: FlowSpecComplexity;
    tools?: string[];
    languages?: string[];
    tags?: string[];
  };
  metrics?: {
    setupTime?: string;
    runsTested?: number;
    successRate?: number;
    avgExecutionTime?: string;
    lastTested?: string;
    costPerRun?: string;
  };
  changelog?: Record<string, string>;
}

export interface FlowSpecProblem {
  statement: string;
  audience: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    technicalLevel: "non-technical" | "semi-technical" | "technical";
  };
  impact: {
    timeSavedPerRun: string;
    runsPerMonth: number;
    totalTimeSaved: string;
    errorReduction?: string;
    roiCalculation?: string;
  };
  prerequisites: {
    accounts: string[];
    permissions: string[];
    knowledge: string;
    hardware?: string;
    cost?: string;
  };
}

export interface FlowSpecFlow {
  description: string;
  diagram: string;
  boundaries: {
    startsWhen: string;
    endsWhen: string;
    runs: "on-trigger" | "scheduled" | "manual";
    concurrency?: string;
    timeout?: string;
    retryPolicy?: string;
  };
}

export interface FlowSpecStep {
  id: string;
  name: string;
  type: FlowSpecStepType;
  description: string;
  optional?: boolean;
  input?: {
    data?: string;
    source?: string;
    format?: string;
    config?: string;
  };
  process?: {
    action: string;
    logic: string;
  };
  aiConfig?: string;
  condition?: string;
  output?: {
    data?: string;
    passesTo?: string | string[];
  };
  onError?: Record<string, string>;
}

export interface FlowSpecDataSchema {
  id: string;
  description: string;
  producedBy?: string;
  consumedBy?: string | string[];
  inherits?: string;
  fields: FlowSpecField[];
  example?: Record<string, unknown>;
}

export interface FlowSpecField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  range?: string;
  defaultValue?: unknown;
}

export interface FlowSpecConfigVariable {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  description: string;
  range?: string;
}

export interface FlowSpecAIConfig {
  id: string;
  name: string;
  stepRef: string;
  model: {
    provider: string;
    modelId: string;
    fallback?: string;
    justification?: string;
  };
  parameters: {
    temperature: number;
    maxTokens: number;
    timeout?: string;
  };
  systemPrompt: string;
  userPromptTemplate: string;
  fewShotExamples?: {
    count: number;
    location: string;
    rationale: string;
  };
  responseParsing: {
    format: string;
    strategy: string;
  };
  qualityMetrics?: {
    testedOn?: number;
    accuracy?: number;
    costPerCall?: string;
  };
  calibration?: Record<string, string>;
}

export interface FlowSpecIntegration {
  id: string;
  service: string;
  role: string;
  usedBy: string[];
  optional?: boolean;
  authentication: {
    method: string;
    scopes?: string[];
    setup: string;
  };
  endpoints: Record<
    string,
    {
      method: string;
      path?: string;
      url?: string;
      purpose?: string;
    }
  >;
  rateLimits?: {
    limit: string;
    impact: string;
  };
  costEstimate?: Record<string, string>;
}

export interface FlowSpecImplementationStep {
  id: string;
  title: string;
  estimatedTime?: string;
  action: string;
  verify: string;
  optional?: boolean;
  onFailure?: string;
}

export interface FlowSpecError {
  id: string;
  name: string;
  stepRef?: string | string[];
  severity: FlowSpecSeverity;
  trigger: string;
  behavior: string;
  userAction: string;
  autoResolution?: string;
}

export interface FlowSpecTest {
  id: string;
  name: string;
  type: FlowSpecTestType;
  priority: FlowSpecTestPriority;
  testsSteps?: string[];
  input: {
    file?: string;
    data?: string;
    method?: string;
  };
  expectedResult: Record<string, unknown>;
  passCriteria: string;
}

// ─────────────────────────────────────────────────────────────
// Validation Types
// ─────────────────────────────────────────────────────────────

export interface FlowSpecValidationCheck {
  section: string;
  passed: boolean;
  message: string;
  severity: FlowSpecSeverity;
}

export interface FlowSpecValidationResult {
  valid: boolean;
  score: number;
  checks: FlowSpecValidationCheck[];
  blockPresence: Record<string, boolean>;
  stepCount: number;
  errorCount: number;
  testCount: number;
  hasAILayer: boolean;
  crossReferenceErrors: string[];
}

// ─────────────────────────────────────────────────────────────
// Parsed Document Type
// ─────────────────────────────────────────────────────────────

export interface FlowSpecDocument {
  version: string;
  header: FlowSpecHeader;
  problem: FlowSpecProblem;
  flow: FlowSpecFlow;
  steps: FlowSpecStep[];
  datamap: {
    schemas: FlowSpecDataSchema[];
    config: FlowSpecConfigVariable[];
  };
  aiLayer?: FlowSpecAIConfig[];
  integrations: FlowSpecIntegration[];
  implementation: FlowSpecImplementationStep[];
  errors: FlowSpecError[];
  tests: FlowSpecTest[];
}
