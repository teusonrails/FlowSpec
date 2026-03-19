# FlowSpec Specification v1.0.0

> The standard language for describing AI-powered automation workflows.

## Document Structure

Every FlowSpec document follows this exact top-level structure:

```
FLOWSPEC <version>
========================================
@header { ... }
@problem { ... }
@flow { ... }
@steps { ... }
@datamap { ... }
@ai_layer { ... }          // required if automation uses AI
@integrations { ... }
@implementation { ... }
@errors { ... }
@tests { ... }
```

## Block Markers

| Marker | Required | Purpose |
|--------|----------|---------|
| `@header` | always | Identity, classification, metrics |
| `@problem` | always | Problem statement, audience, impact, prerequisites |
| `@flow` | always | High-level flow overview with diagram |
| `@steps` | always | Detailed step-by-step specification |
| `@datamap` | always | Data schemas, transformations, config variables |
| `@ai_layer` | if AI used | AI model configs, prompts, calibration |
| `@integrations` | always | External service connections and endpoints |
| `@implementation` | always | Step-by-step deployment guide |
| `@errors` | always | Error catalog and troubleshooting |
| `@tests` | always | Validation test cases |

## Field Markers

Inside blocks, fields use `#` marker:

```
#field_name: value
#field_name: [list, of, values]
#field_name:
  sub_field: value
```

## Type Annotations

| Type | Description | Type | Description |
|------|-------------|------|-------------|
| `<str>` | String | `<date>` | ISO 8601 date |
| `<num>` | Number (int or decimal) | `<datetime>` | ISO 8601 datetime |
| `<bool>` | Boolean | `<binary>` | File/binary data |
| `<list>` | Ordered collection | `<map>` | Key-value pairs |
| `<enum:A\|B>` | Fixed set of options | `<any>` | Untyped |
| `<dur>` | Duration (e.g. 15min) | `<null>` | Absence of value |
| `<url>` | URL | `<ver>` | Semantic version |
| `<schema>` | Data schema reference | `<prompt>` | AI prompt text |
| `<ref:STEP>` | Cross-reference | | |

## Annotation Markers

| Marker | Purpose |
|--------|---------|
| `::required` | Field is mandatory |
| `::optional` | Field is optional |
| `::deprecated` | Phased out |
| `::note` | Inline documentation |
| `::warn` | Highlights risk or caveat |
| `::example` | Provides concrete example |
| `::default` | Declares default value |
| `::range` | Valid numeric range (e.g. `::range 0.0..2.0`) |
| `::since` | Version when introduced |
| `::see` | Cross-reference to another section |
| `::no_default` | Explicitly has no default |

## Reference System

Dot-notation references link between sections:

```
@block.element_id                   → @steps.STEP-03
@block.element_id.field             → @steps.STEP-03.output
@block.element_id.field.subfield    → @datamap.INVOICE.fields.amount
```

References in fields use `->` operator:

```
#source -> @steps.STEP-02.output
#schema -> @datamap.INVOICE
#handler -> @errors.E-003
```

## Step Types

| Type | Code | Description |
|------|------|-------------|
| TRIGGER | TRG | Event that starts the flow |
| INPUT | INP | Data ingestion from external source |
| TRANSFORM | TRN | Data reshaping without AI |
| AI_PROCESS | AIP | AI-powered processing step |
| DECISION | DEC | Conditional branching logic |
| ACTION | ACT | External side effect (send, write, post) |
| OUTPUT | OUT | Final data delivery |
| WAIT | WAI | Pause / delay / human approval gate |
| LOOP | LOP | Iteration over collection |
| AGGREGATE | AGG | Combine multiple items into one |
| FORK | FRK | Split into parallel paths |
| JOIN | JON | Merge parallel paths back |
| ERROR_HANDLER | ERH | Error recovery subroutine |
| SUBFLOW | SUB | Reference to another FlowSpec |

## Diagram Syntax

| Symbol | Meaning |
|--------|---------|
| `TRIGGER(label)` | Entry point |
| `STEP-XX[label]` | Process step |
| `STEP-XX{label}` | Decision point |
| `-- condition -->` | Conditional branch |
| `-->` | Unconditional flow |
| `END(label)` | Terminal |
| `\|STEP-XX\|` | Parallel group |
| `(STEP-XX)` | Optional step |
| `STEP-XX[label] !! @ref` | Error handler link |

## Template Variables in Prompts

| Variable | Description |
|----------|-------------|
| `{{field_name}}` | Direct field reference |
| `{{config.variable}}` | Config variable from `@datamap.CONFIG` |
| `{{STEP-XX.field}}` | Output from referenced step |
| `{{_timestamp}}` | System: current ISO timestamp |
| `{{_run_id}}` | System: unique execution ID |
| `{{= "literal" }}` | Static text injection |
| `{{? field : fallback }}` | Field value or fallback if null |

## Complexity Criteria

| Level | Steps | Integrations | AI Calls | Setup Time |
|-------|-------|--------------|----------|------------|
| basic | 1-5 | 1-2 | 0-1 | < 30min |
| intermediate | 6-15 | 2-5 | 1-3 | 30min-2h |
| advanced | 15+ | 5+ | 3+ | 2h+ |

## Error Severity Levels

| Level | Flow Impact | User Notification |
|-------|-------------|-------------------|
| info | None — flow continues | Logged only |
| warning | Flow continues with fallback | Logged + optional alert |
| error | Current item fails | Alert sent |
| critical | Flow pauses entirely | Immediate alert + action required |

## Package Structure

```
automation-name-vX.Y.Z/
├── FLOWSPEC.md              ← The specification document
├── README.md                ← Quick-start summary
├── CHANGELOG.md             ← Version history
├── workflow/
│   ├── n8n/
│   │   └── workflow-name.json
│   └── make/
│       └── workflow-name.json
├── prompts/
│   ├── extraction-system.txt
│   ├── extraction-user-template.txt
│   └── few_shot_examples.json
├── files/
│   ├── test/                ← Test input files
│   ├── optional/            ← Optional add-on nodes
│   └── diagnostics/
└── assets/
    ├── flow-diagram.png
    └── screenshots/
```

## AI Model Selection Guide

### Claude (Anthropic)

| Model | Best for | Cost (per 1M tokens) | Speed |
|-------|----------|---------------------|-------|
| Claude Opus 4 | Complex reasoning, long docs, multi-step analysis | $15 in / $75 out | Slow |
| Claude Sonnet 4 | Best balance: structured extraction, generation, analysis | $3 in / $15 out | Medium |
| Claude Haiku 3.5 | Classification, simple extraction, categorization | $0.80 in / $4 out | Fast |

### OpenAI

| Model | Best for | Cost (per 1M tokens) | Speed |
|-------|----------|---------------------|-------|
| GPT-4o | Multimodal (images+text), strong general-purpose | $2.50 in / $10 out | Medium |
| GPT-4o-mini | Lightweight tasks, high volume, cost-sensitive | $0.15 in / $0.60 out | Fast |

### Model Selection Decision Tree

1. Simple classification/routing with <5 categories? → **Claude Haiku 3.5**
2. Structured data extraction from documents? → **Claude Sonnet 4**
3. Processing images (photos, screenshots)? → **Claude Sonnet 4** or **GPT-4o**
4. Complex multi-step reasoning over long documents? → **Claude Opus 4**
5. Volume >10,000 calls/day and simple task? → **GPT-4o-mini**

Always document a fallback model in case primary is unavailable.

### Cost Calculation Template

For each AI_PROCESS step, calculate:

```
Average input tokens:  [estimate based on document size + prompt]
Average output tokens:  [estimate based on expected response size]
Model cost:            [input_tokens × input_price + output_tokens × output_price]
Calls per item:        [usually 1, but some workflows need multiple]
Items per month:       [from @problem.impact.runs_per_month]
Monthly API cost:      [cost_per_call × calls_per_item × items_per_month]
```

**Example:**
```
Claude Sonnet 4, invoice extraction:
Input: ~800 tokens (prompt + document) × $3/1M = $0.0024
Output: ~400 tokens (JSON response) × $15/1M = $0.006
Per call: $0.0084
200 invoices/month: $1.68/month
```
