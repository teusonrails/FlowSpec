/**
 * FlowSpec AI System Prompt
 *
 * Used by the FlowSpec Architect AI when generating or analyzing
 * FlowSpec documents. This prompt is embedded in the AI-powered
 * generation features of the marketplace.
 */

export const FLOWSPEC_ARCHITECT_SYSTEM_PROMPT = `You are FlowSpec Architect, an AI specialist in designing, documenting, and architecting AI-powered automation workflows using the FlowSpec standard.

## YOUR IDENTITY
You are a senior automation architect with deep expertise in:
- AI-powered workflow design (n8n, Make, Zapier, Python, LangChain, CrewAI)
- Prompt engineering and AI model selection (Claude, GPT-4, Gemini, open-source models)
- API integration architecture (REST, webhooks, OAuth, GraphQL)
- Data pipeline design and transformation
- Error handling, resilience, and observability in automated systems
- Technical documentation that is precise enough to implement without questions

## YOUR PURPOSE
When given an automation description, you:
1. Analyze the problem — task, audience, tools, edge cases
2. Architect the solution — steps, decision points, error handling, AI processing
3. Select AI models — based on task complexity, cost, and speed tradeoffs
4. Write calibrated prompts — production-quality with few-shot examples
5. Produce a complete FlowSpec document — every section filled, every reference resolved

## FLOWSPEC BLOCKS
Every FlowSpec document requires these blocks:
- @header: Identity, classification, metrics
- @problem: Problem statement, audience, impact, prerequisites
- @flow: High-level flow overview with diagram
- @steps: Detailed step-by-step specification
- @datamap: Data schemas, transformations, config variables
- @ai_layer: AI model configs, prompts, calibration (required if AI used)
- @integrations: External service connections and endpoints
- @implementation: Step-by-step deployment guide
- @errors: Error catalog and troubleshooting
- @tests: Validation test cases

## STEP TYPES
TRIGGER, INPUT, TRANSFORM, AI_PROCESS, DECISION, ACTION, OUTPUT, WAIT, LOOP, AGGREGATE, FORK, JOIN, ERROR_HANDLER, SUBFLOW

## AI MODEL SELECTION
- Claude Haiku 3.5: Simple classification, routing (<5 categories)
- Claude Sonnet 4: Structured extraction, generation, analysis (default choice)
- Claude Opus 4: Complex multi-step reasoning over long documents
- GPT-4o: Multimodal tasks, fallback for Claude Sonnet
- GPT-4o-mini: High-volume simple tasks (>10K calls/day)

## RULES
1. Every section must be present — no shortcuts, no "see above"
2. Every cross-reference must resolve
3. Every field in @datamap must have a type and description
4. Every schema must have a concrete ::example
5. Every AI prompt must be production-ready
6. Every implementation step must have a verify condition
7. Every error must have a user_action
8. Every test must have concrete expected values
9. CONFIG must cover everything the implementer needs to customize
10. Cost estimates must be realistic based on actual token counts`;

/**
 * AI model pricing data for cost calculations.
 */
export const AI_MODEL_PRICING = {
  "claude-sonnet-4": {
    provider: "anthropic",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    speed: "medium",
    bestFor: "Structured extraction, generation, analysis",
  },
  "claude-haiku-3.5": {
    provider: "anthropic",
    inputPer1M: 0.8,
    outputPer1M: 4.0,
    speed: "fast",
    bestFor: "Classification, simple extraction, categorization",
  },
  "claude-opus-4": {
    provider: "anthropic",
    inputPer1M: 15.0,
    outputPer1M: 75.0,
    speed: "slow",
    bestFor: "Complex reasoning, long docs, multi-step analysis",
  },
  "gpt-4o": {
    provider: "openai",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    speed: "medium",
    bestFor: "Multimodal (images+text), strong general-purpose",
  },
  "gpt-4o-mini": {
    provider: "openai",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    speed: "fast",
    bestFor: "Lightweight tasks, high volume, cost-sensitive",
  },
} as const;

export type AIModelId = keyof typeof AI_MODEL_PRICING;

/**
 * Calculate estimated cost for an AI API call.
 */
export function calculateAICost(
  modelId: AIModelId,
  inputTokens: number,
  outputTokens: number
): { perCall: number; formatted: string } {
  const model = AI_MODEL_PRICING[modelId];
  const inputCost = (inputTokens / 1_000_000) * model.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputPer1M;
  const perCall = inputCost + outputCost;
  return {
    perCall,
    formatted: `$${perCall.toFixed(4)}`,
  };
}

/**
 * Calculate monthly cost estimate.
 */
export function calculateMonthlyCost(
  modelId: AIModelId,
  inputTokens: number,
  outputTokens: number,
  callsPerItem: number,
  itemsPerMonth: number
): { monthly: number; formatted: string } {
  const { perCall } = calculateAICost(modelId, inputTokens, outputTokens);
  const monthly = perCall * callsPerItem * itemsPerMonth;
  return {
    monthly,
    formatted: `$${monthly.toFixed(2)}/month`,
  };
}

/**
 * Automation archetypes for pattern matching.
 */
export const AUTOMATION_ARCHETYPES = [
  {
    id: "document-processor",
    name: "Document Processor",
    pattern:
      "Receive document → Extract data via AI → Validate → Output structured data",
    useCases: [
      "Invoice processing",
      "Receipt scanning",
      "Contract analysis",
      "Resume parsing",
    ],
    recommendedModel: "claude-sonnet-4" as AIModelId,
    temperature: 0.1,
  },
  {
    id: "lead-enricher",
    name: "Lead/Data Enricher",
    pattern:
      "Receive lead/entity → Research via web/API → AI analysis → Score/classify → Output enriched data",
    useCases: [
      "Lead qualification",
      "Company research",
      "Competitor monitoring",
      "Prospect enrichment",
    ],
    recommendedModel: "claude-sonnet-4" as AIModelId,
    temperature: 0.2,
  },
  {
    id: "content-generator",
    name: "Content Generator",
    pattern:
      "Receive context/trigger → AI generates content → Quality check → Deliver/publish",
    useCases: [
      "Review responses",
      "Email drafts",
      "Social media posts",
      "Report generation",
    ],
    recommendedModel: "claude-sonnet-4" as AIModelId,
    temperature: 0.7,
  },
  {
    id: "monitor-alert",
    name: "Monitor & Alert",
    pattern:
      "Periodically check source → Detect changes → AI analysis → Alert if relevant",
    useCases: [
      "Price monitoring",
      "Regulatory tracking",
      "Brand mentions",
      "Inventory alerts",
    ],
    recommendedModel: "claude-haiku-3.5" as AIModelId,
    temperature: 0.0,
  },
  {
    id: "workflow-orchestrator",
    name: "Workflow Orchestrator",
    pattern:
      "Receive trigger → Execute multi-service workflow → Coordinate outputs",
    useCases: [
      "Client onboarding",
      "Order fulfillment",
      "Project setup",
      "Employee provisioning",
    ],
    recommendedModel: "claude-haiku-3.5" as AIModelId,
    temperature: 0.2,
  },
  {
    id: "conversation-agent",
    name: "Conversation/Response Agent",
    pattern:
      "Receive message → Understand intent → Generate response → Deliver",
    useCases: [
      "Customer support triage",
      "FAQ responder",
      "Review responder",
      "Email auto-responder",
    ],
    recommendedModel: "claude-sonnet-4" as AIModelId,
    temperature: 0.5,
  },
] as const;
