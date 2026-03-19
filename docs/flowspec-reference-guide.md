# FlowSpec Reference Guide & Automation Patterns

This document contains reusable patterns, domain templates, common integrations, and worked examples for generating FlowSpec documents.

## Part I — Automation Archetypes

Every automation falls into one of these archetypes. Identify which archetype(s) match and use the corresponding pattern as a starting point.

### Archetype 1: Document Processor

**Pattern:** Receive document → Extract data via AI → Validate → Output structured data

**Common use cases:** Invoice processing, receipt scanning, contract analysis, resume parsing, medical record extraction, form digitization

**Typical flow:**
```
TRIGGER(Document arrives)
  --> STEP-01[Extract/download document]
  --> STEP-02{Supported format?}
      -- yes --> STEP-03[AI extraction]
      -- no  --> STEP-04[Log unsupported]
  --> STEP-03
  --> STEP-05[Validate extracted data]
  --> STEP-06{Confidence >= threshold?}
      -- yes --> STEP-07[Process/categorize]
               --> STEP-08[Write to output]
      -- no  --> STEP-09[Route to human review]
```

**Key AI decisions:**
- Model: Claude Sonnet 4 for extraction (best accuracy/cost balance)
- Temperature: 0.0-0.1 (deterministic extraction)
- Always include confidence scoring in the prompt
- Always have a human review path for low-confidence results

**Error patterns:**
- Unsupported file format → log and skip
- AI returns invalid JSON → retry once with explicit JSON instruction
- Confidence below threshold → human review queue
- 3 consecutive low-confidence → circuit breaker

### Archetype 2: Lead/Data Enricher

**Pattern:** Receive lead/entity → Research via web/API → AI analysis → Score/classify → Output enriched data

**Common use cases:** Lead qualification, company research, competitor monitoring, prospect enrichment, vendor evaluation

**Typical flow:**
```
TRIGGER(New lead/entity received)
  --> STEP-01[Extract entity identifiers]
  --> STEP-02[Fetch data from multiple sources]
      |STEP-02a|[Source A: CRM/database]
      |STEP-02b|[Source B: Web scraping/API]
      |STEP-02c|[Source C: Social/public data]
  --> STEP-03[JOIN: Merge data from all sources]
  --> STEP-04[AI analysis and scoring]
  --> STEP-05{Score >= threshold?}
      -- high   --> STEP-06[Priority action]
      -- medium --> STEP-07[Standard action]
      -- low    --> STEP-08[Archive/deprioritize]
```

**Key AI decisions:**
- Model: Claude Sonnet 4 for analysis, Haiku for simple classification
- Temperature: 0.2-0.3 (allow some reasoning flexibility)
- Scoring should use explicit criteria, not vague "assess quality"
- Include reasoning in output for transparency

### Archetype 3: Content Generator

**Pattern:** Receive context/trigger → AI generates content → Quality check → Deliver/publish

**Common use cases:** Review responses, email drafts, social media posts, report generation, meeting summaries, product descriptions

**Typical flow:**
```
TRIGGER(Content need detected)
  --> STEP-01[Gather context data]
  --> STEP-02[AI content generation]
  --> STEP-03{Quality check}
      -- auto-approve  --> STEP-04[Deliver/publish]
      -- needs-review  --> STEP-05[Queue for approval]
      -- rejected      --> STEP-06[Regenerate with feedback]
```

### Archetype 4: Monitor & Alert

**Pattern:** Periodically check source → Detect changes/conditions → AI analysis → Alert if relevant

**Common use cases:** Price monitoring, regulatory change tracking, competitor monitoring, brand mention tracking, inventory alerts

**Typical flow:**
```
TRIGGER(Scheduled: every X minutes/hours)
  --> STEP-01[Fetch current state from source]
  --> STEP-02[Compare with previous state]
  --> STEP-03{Change detected?}
      -- no  --> END(No action)
      -- yes --> STEP-04[AI: Analyze change significance]
  --> STEP-05{Significant?}
      -- yes --> STEP-06[Generate alert/report]
               --> STEP-07[Deliver notification]
      -- no  --> STEP-08[Log change, no alert]
```

### Archetype 5: Workflow Orchestrator

**Pattern:** Receive trigger → Execute multi-service workflow with conditional logic → Coordinate outputs

**Common use cases:** Client onboarding, order fulfillment, project setup, employee provisioning, multi-channel publishing

### Archetype 6: Conversation/Response Agent

**Pattern:** Receive message → Understand intent → Generate contextual response → Deliver

**Common use cases:** Customer support triage, FAQ responder, review responder, chatbot, email auto-responder

**Typical flow:**
```
TRIGGER(Message received)
  --> STEP-01[Extract message content and metadata]
  --> STEP-02[AI: Classify intent/sentiment]
  --> STEP-03{Can auto-respond?}
      -- yes --> STEP-04[AI: Generate response]
               --> STEP-05{Approval needed?}
                   -- no  --> STEP-06[Send response]
                   -- yes --> STEP-07[Queue for approval]
      -- no  --> STEP-08[Escalate to human]
```

## Part II — Domain Templates

### Finance
- **Common automations:** Invoice processing, expense categorization, financial report generation
- **Typical tools:** Gmail, Google Sheets, QuickBooks, Xero, Stripe, bank APIs
- **Key concern:** Accuracy is critical — financial errors have direct cost impact
- **Recommended threshold:** Confidence >= 85% for auto-processing
- **Config variables:** `expense_categories`, `currency`, `tax_rate`, `fiscal_year_start`, `accounting_system_id`, `approval_threshold_amount`, `review_email`

### Sales
- **Common automations:** Lead qualification, CRM enrichment, follow-up emails, deal progression
- **Typical tools:** HubSpot, Salesforce, Pipedrive, LinkedIn, Clearbit, Gmail
- **Key concern:** Speed matters — leads go cold
- **Recommended threshold:** Confidence >= 70% (speed > perfection)
- **Config variables:** `crm_api_key`, `scoring_criteria`, `ideal_customer_profile`, `follow_up_delay_hours`, `sales_team_email`, `priority_threshold`

### Support
- **Common automations:** Ticket triage, auto-response, sentiment analysis, escalation detection
- **Typical tools:** Zendesk, Intercom, Freshdesk, Slack, email
- **Key concern:** Tone and empathy in responses
- **Recommended threshold:** Auto-respond only for simple FAQ (confidence >= 95%)
- **Config variables:** `support_categories`, `escalation_rules`, `auto_response_enabled`, `sla_hours_by_priority`, `team_slack_channel`

### Marketing
- **Common automations:** Social media posts, content repurposing, brand monitoring, competitor tracking
- **Typical tools:** Buffer, Hootsuite, Mailchimp, Google Analytics
- **Key concern:** Brand voice consistency
- **Recommended threshold:** Always human approval for public-facing content
- **Config variables:** `brand_voice_guidelines`, `target_audience`, `content_calendar_id`, `approved_hashtags`, `competitor_list`

### Operations
- **Common automations:** Meeting summarization, process documentation, inventory monitoring
- **Typical tools:** Google Meet/Zoom, Notion, Airtable, Slack, Google Sheets
- **Key concern:** Actionability — summaries must produce action items
- **Config variables:** `team_members`, `notification_channel`, `report_frequency`, `template_id`, `timezone`

### E-commerce
- **Common automations:** Product descriptions, review analysis, inventory alerts, order processing
- **Typical tools:** Shopify, WooCommerce, Stripe, Google Sheets
- **Key concern:** Volume — cost control matters
- **Config variables:** `store_url`, `api_key`, `default_currency`, `shipping_zones`, `low_stock_threshold`

## Part III — Prompt Engineering Patterns

### Pattern 1: Structured Extraction

```
You are a [domain] specialist. Extract structured data from the provided [document type].

## RULES
1. Extract ONLY information explicitly present in the document
2. Never infer or fabricate data not visible in the source
3. For [specific data type]: [specific formatting instruction]
4. If a field is not found, set it to null
5. Confidence scoring: [specific criteria for each range]

## OUTPUT FORMAT
Respond with ONLY a JSON object matching this schema:
{
  "field1": "type",
  "field2": "type or null",
  ...
  "confidence_score": number
}

Do not include any text outside the JSON object.
```

### Pattern 2: Classification

```
Classify the following [item] into exactly ONE category from the provided list.

CATEGORIES:
{{config.categories}}

RULES:
1. Choose the single most appropriate category
2. If uncertain between two, choose the more specific one
3. Use "[fallback category]" only if nothing else fits
4. Respond with ONLY a JSON object

OUTPUT:
{
  "category": "exact category name from list",
  "reasoning": "one sentence explanation"
}
```

### Pattern 3: Content Generation

```
You are a [role] writing [content type] for [audience].

## CONTEXT
[Relevant background information from {{variables}}]

## TASK
[Specific generation instruction]

## CONSTRAINTS
- Tone: [formal/casual/technical/friendly]
- Length: [specific word/sentence count or range]
- Must include: [required elements]
- Must NOT include: [prohibited elements]
- Language: [target language]

## FORMAT
[Exact output format specification]
```

### Pattern 4: Decision/Routing

```
Analyze the following [input] and determine the appropriate action.

POSSIBLE ACTIONS:
1. [Action A] — when [condition]
2. [Action B] — when [condition]
3. [Action C] — when [condition]

INPUT:
{{input_data}}

Respond with ONLY a JSON object:
{
  "action": "action_name",
  "reasoning": "brief explanation",
  "confidence": number (0-100)
}
```

## Part IV — Common Integration Patterns

### Email (Gmail / Outlook)
- **Authentication:** OAuth 2.0
- **Gmail scopes:** `gmail.readonly`, `gmail.modify`, `gmail.send`
- **Rate limits:** Gmail 250 quota units/sec, Outlook 10,000 requests/10min
- **Pitfalls:** OAuth tokens expire periodically; attachment download is a separate API call; mark as read after processing

### Spreadsheets (Google Sheets / Airtable)
- **Authentication:** OAuth 2.0 (Sheets), API Key (Airtable)
- **Rate limits:** Sheets 60 req/min/user, Airtable 5 req/sec
- **Pitfalls:** Reference columns by header name, not position; no native change detection in Sheets

### CRM (HubSpot / Salesforce / Pipedrive)
- **Authentication:** OAuth 2.0 or API Key
- **Rate limits:** HubSpot 100/10sec, Salesforce varies
- **Pitfalls:** Custom fields have internal names different from display names; duplicate detection before creating records

### AI Providers (Anthropic / OpenAI)
- **Anthropic:** `x-api-key` header + `anthropic-version` header
- **OpenAI:** `Authorization: Bearer` header
- **Pitfalls:** Always set `max_tokens`; parse JSON defensively (AI sometimes adds markdown fences); implement retry with exponential backoff for 429/529

## Part V — Quality Checklist

### Completeness
- [ ] All 10 blocks present (@header through @tests)
- [ ] @ai_layer present if any step type is AI_PROCESS
- [ ] Every step has: name, type, description, input, process, output, on_error
- [ ] Every AI_PROCESS step has: ai_config reference, model, prompt, parsing
- [ ] Every integration has: service, authentication, endpoints, rate_limits
- [ ] CONFIG has every variable the implementer needs to set
- [ ] At least 1 smoke test, 1 functional test, 1 edge case test

### Accuracy
- [ ] All cross-references resolve (`-> @X.Y` exists)
- [ ] All STEP-XX in diagram exist in @steps
- [ ] All error codes in on_error exist in @errors
- [ ] All schema names in data flows exist in @datamap
- [ ] Cost estimates calculated from real model pricing

### Quality
- [ ] Prompts are production-ready (not sketches)
- [ ] Every prompt has explicit output format
- [ ] Every prompt has rules about what NOT to do
- [ ] Few-shot examples included for complex extraction tasks
- [ ] Examples use realistic domain-appropriate data
- [ ] Implementation steps are followable by a first-timer
- [ ] Error messages tell the user what to DO, not just what went wrong
- [ ] Test expected_results have concrete values

### Consistency
- [ ] Naming conventions consistent (STEP-XX, E-XXX, IMPL-XX, TEST-XX)
- [ ] Date formats consistent (ISO 8601)
- [ ] Price/amount formats consistent
- [ ] Status values consistent across steps and errors
- [ ] Terminology consistent throughout
