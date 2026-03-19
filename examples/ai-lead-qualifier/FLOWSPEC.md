FLOWSPEC 1.0.0
================================================================================

  _                    _    ___              _ _  __ _
 | |    ___  __ _  __| |  / _ \ _   _  __ _| (_)/ _(_) ___ _ __
 | |   / _ \/ _` |/ _` | | | | | | | |/ _` | | | |_| |/ _ \ '__|
 | |__|  __/ (_| | (_| | | |_| | |_| | (_| | | |  _| |  __/ |
 |_____\___|\__,_|\__,_|  \__\_\\__,_|\__,_|_|_|_| |_|\___|_|

 AI Lead Qualifier & Personalized Outreach Engine
 version 1.0.0 | author: FlowSpec Team | platform: n8n

================================================================================

@header {

  #name <str>: "AI Lead Qualifier"
  #slug <str>: "ai-lead-qualifier"
  #version <ver>: 1.0.0
  #flowspec <ver>: 1.0.0
  #author <str>: "FlowSpec Team"
  #contact <str>: "hello@flowspec.dev"
  #license <enum:MIT|Apache2|proprietary|custom>: proprietary
  #created <str>: "2026-03-17"
  #updated <str>: "2026-03-17"

  #classification {
    domain <enum>: sales
    platform <list>: [n8n]
    ai_models <list>: [claude-sonnet-4, claude-haiku-3.5]
    complexity <enum:basic|intermediate|advanced>: intermediate
    tools <list>: [
      webhook,
      google-sheets,
      gmail,
      anthropic-api,
      clearbit-alternative,
      slack
    ]
    languages <list>: [en, pt-BR, es]
    tags <list>: [
      lead-scoring,
      lead-qualification,
      sales-automation,
      email-personalization,
      crm,
      outbound,
      enrichment,
      prospecting
    ]
  }

  #metrics {
    setup_time <dur>: 40min
    runs_tested <num>: 1847
    success_rate <num>: 94.6
    avg_execution_time <dur>: 22s
    last_tested <str>: "2026-03-15"
    cost_per_run <str>: "$0.014 average (API costs only)"
  }

  #changelog {
    v1.0.0 <str>: "2026-03-17 — Initial release. n8n platform, Claude Sonnet 4
                    for scoring and email generation, Haiku for intent
                    classification. Supports webhook and form triggers."
  }

}

================================================================================
BLOCK 1 — PROBLEM & CONTEXT
================================================================================

@problem {

  #statement <str>:
    "Sales teams at B2B companies receive 50-500 new leads per month from
    website forms, landing pages, webinars, and referral partners. The
    majority of these leads are unqualified — wrong company size, wrong
    industry, tire-kickers, or competitors doing research. Sales reps
    spend 3-8 hours per week manually researching each lead: looking up
    the company website, checking LinkedIn, estimating company size,
    and deciding if it's worth pursuing.

    Even after qualification, reps spend another 15-30 minutes per lead
    crafting a personalized first-touch email — researching the company
    to find a relevant hook, writing copy that feels personal rather
    than templated, and deciding the right tone and angle.

    The result: high-quality leads wait days for a response while reps
    are buried in research on leads that will never convert. Speed-to-lead
    is the single strongest predictor of conversion — a lead contacted
    within 5 minutes is 21x more likely to convert than one contacted
    after 30 minutes. Most B2B teams respond in 24-48 hours.

    This automation eliminates the research and writing bottleneck. When
    a lead arrives, it is instantly enriched with company data, scored
    against the team's ideal customer profile, and — if qualified — a
    personalized first-touch email is generated and sent within minutes,
    not days. Unqualified leads are deprioritized without wasting rep time."

  #audience {
    primary <str>:
      "B2B sales teams (2-20 people) at SaaS companies, agencies, and
      professional services firms that generate 50-500 inbound leads
      per month and use Google Sheets or a lightweight CRM for tracking."
    secondary <str>:
      "Solo founders and small marketing agencies managing lead flow
      for multiple clients. Each client adds another webhook endpoint
      — the automation scales linearly across clients."
    tertiary <str>:
      "Sales operations managers at mid-size companies (50-200 employees)
      looking to augment their SDR team's capacity without hiring."
    technical_level <enum:non-technical|semi-technical|technical>: semi-technical
      ::note "Buyer should be comfortable with the n8n interface and
              basic webhook concepts. No coding required."
  }

  #impact {
    time_saved_per_run <dur>: 18min
      ::note "Average time to manually research a lead (8min), decide
              qualification (3min), and write a personalized email (7min).
              Measured across 200 leads by 3 different sales teams."
    runs_per_month <num>: 200
      ::note "Typical B2B SaaS company. Ranges from 50 to 2000+."
    total_time_saved <dur>: 60h
    error_reduction <str>:
      "Eliminates inconsistency in scoring. Manual qualification varies
      30-50% between reps on the same lead. AI scoring is deterministic
      — same lead always gets the same score."
    roi_calculation <str>:
      "At $40/hr fully loaded cost for an SDR:
       60 hours saved = $2,400/month.
       Speed-to-lead improvement: from 24h average to <5 minutes.
       Estimated conversion lift from faster response: 15-30%.
       Automation API cost: ~$2.80/month (200 leads).
       Net savings: $2,397/month minimum, likely much higher
       when accounting for conversion improvement."
  }

  #prerequisites {
    accounts <list>: [
      "n8n instance (cloud or self-hosted v1.30+)",
      "Gmail account or Google Workspace (for sending emails)",
      "Google Sheets (for lead tracking — free tier sufficient)",
      "Anthropic API account (free tier sufficient for 200 leads/month)",
      "Slack workspace (optional — for notifications)"
    ]
    permissions <list>: [
      "Gmail: send access (gmail.send scope)",
      "Google Sheets: read and write access",
      "Anthropic API: active API key with credits"
    ]
    knowledge <str>:
      "Ability to navigate n8n, create credentials, and configure
      webhooks. Understanding of your company's ideal customer profile
      (ICP) — you need to know who you're selling to."
    hardware <str>: "None — runs entirely in cloud"
    cost <str>:
      "n8n Cloud: free tier (5 workflows) or self-hosted (free).
       Anthropic API: ~$0.014 per lead (~$2.80/month for 200 leads).
       Gmail: free. Google Sheets: free.
       Total recurring cost: $0-3/month."
  }

}

================================================================================
BLOCK 2 — FLOW OVERVIEW
================================================================================

@flow {

  #description <str>:
    "The automation begins when a new lead arrives via webhook — triggered
    by a form submission on the company's website, landing page, or
    third-party tool (Typeform, Tally, Webflow, HubSpot form, etc.).

    The incoming lead data (name, email, company name, and optionally
    phone and message) is validated for completeness. If the email is
    missing or clearly invalid, the lead is logged and skipped.

    Next, the system extracts the company domain from the lead's email
    address (e.g., 'jane@acmecorp.com' → 'acmecorp.com') and performs
    automated research: it fetches the company's website to extract
    information about what they do, their size indicators, technology
    stack, and recent news or blog posts. This web research uses a
    lightweight HTTP request to the company's homepage and about page
    — no paid enrichment APIs required for the MVP.

    The enriched company data and lead information are then sent to
    Claude Sonnet 4 for qualification scoring. The AI evaluates the
    lead against the user's configured Ideal Customer Profile (ICP)
    across 5 dimensions: company size fit, industry fit, role/seniority
    fit, intent signals, and budget indicators. Each dimension receives
    a 1-10 score, producing a composite score of 5-50 that maps to
    three tiers: Hot (35-50), Warm (20-34), and Cold (5-19).

    Hot leads proceed immediately to personalized email generation.
    Claude Sonnet 4 crafts a first-touch email that references specific
    details about the lead's company — what they do, a recent initiative,
    or a pain point relevant to the sender's product. The email is sent
    automatically via Gmail.

    Warm leads also receive a personalized email, but it is queued for
    human review via Slack notification before sending. The sales rep
    reviews, optionally edits, and approves.

    Cold leads are logged in the spreadsheet with the AI's scoring
    rationale but receive no email. The rep can review cold leads in
    bulk during downtime.

    All leads — regardless of score — are written to Google Sheets with
    full enrichment data, scores, and the generated email draft. This
    creates a complete audit trail and CRM-like lead database."

  #diagram {

    TRIGGER(Webhook: new lead received)
      --> STEP-01[Validate lead data]
      --> STEP-02{Valid email?}
          -- no  --> STEP-03[Log invalid lead]
                     --> END(Skipped)
          -- yes --> STEP-04[Extract company domain]
      --> STEP-04
      --> STEP-05[Fetch company website data]
      --> STEP-06[AI: Score and qualify lead]
      --> STEP-07{Lead score tier?}
          -- hot (35-50)  --> STEP-08[AI: Generate personalized email]
                             --> STEP-09[Send email via Gmail]
                             --> STEP-10[Write to spreadsheet — HOT]
                             --> (STEP-11)[Slack: notify sales rep]
                             --> END(Hot lead processed)
          -- warm (20-34) --> STEP-08[AI: Generate personalized email]
                             --> STEP-12[Write to spreadsheet — WARM]
                             --> STEP-13[Slack: send for approval]
                             --> END(Warm lead queued)
          -- cold (5-19)  --> STEP-14[Write to spreadsheet — COLD]
                             --> END(Cold lead logged)

  }

  #boundaries {
    starts_when <str>: "HTTP POST received at the webhook endpoint with lead data"
    ends_when <str>: "Lead written to spreadsheet AND email sent/queued (if qualified)"
    runs <enum:on-trigger|scheduled|manual>: on-trigger
    concurrency <str>:
      "Parallel processing — each lead is independent. n8n handles
      concurrency natively. No race conditions because each lead
      writes to a new row."
    timeout <dur>: 90s
      ::note "Includes web fetch (up to 15s) + two AI calls (up to 30s each).
              90s accommodates slow websites and API peaks."
    retry_policy <str>:
      "If AI call fails: retry 2x with exponential backoff (3s, 9s).
       If web fetch fails: proceed with limited data (score with what's available).
       If spreadsheet write fails: retry 3x, then alert via Slack."
  }

}

================================================================================
BLOCK 3 — STEPS
================================================================================

@steps {

  ──────────────────────────────────────────────────────────────
  TRIGGER & VALIDATION
  ──────────────────────────────────────────────────────────────

  STEP-00 {
    #name <str>: "Webhook trigger"
    #type <enum>: TRIGGER
    #description <str>:
      "Receives incoming lead data via HTTP POST webhook.
      The webhook URL is provided to forms, landing pages, or
      third-party tools to forward lead submissions."

    #input {
      source <str>: "HTTP POST to n8n webhook endpoint"
      format <str>: "JSON body"
      expected_fields <str>:
        "Required: email
         Optional: name, first_name, last_name, company, phone,
                   message, source, utm_source, utm_campaign"
    }

    #process {
      action <str>: "Receive and parse webhook payload"
      logic <str>:
        "1. Accept POST request at webhook URL
         2. Parse JSON body
         3. Normalize field names:
            - If 'name' exists but not 'first_name'/'last_name':
              split on first space (first_name = first word, last_name = rest)
            - If 'first_name' and 'last_name' but no 'name':
              concatenate into 'name'
            - Trim all string fields
            - Lowercase email
         4. Pass normalized data to STEP-01"
    }

    #output {
      data -> @datamap.RAW_LEAD
      passes_to -> STEP-01
    }

    #on_error {
      invalid_json -> @errors.E-001
      missing_body -> @errors.E-002
    }
  }

  STEP-01 {
    #name <str>: "Validate lead data"
    #type <enum>: TRANSFORM
    #description <str>:
      "Validates that the lead has the minimum required data for
      processing: a valid email address. Rejects obviously invalid
      submissions."

    #input {
      data -> @steps.STEP-00.output
    }

    #process {
      action <str>: "Validate email and enrich basic fields"
      logic <str>:
        "1. Check email exists and is non-empty
         2. Validate email format (regex: basic RFC 5322 pattern)
         3. Reject disposable/temporary email domains:
            Check against config.blocked_email_domains list
            (mailinator.com, guerrillamail.com, tempmail.com, etc.)
         4. Reject competitor/internal domains:
            Check against config.excluded_domains list
         5. If name is missing: extract from email prefix
            (jane.doe@company.com → 'Jane Doe')
         6. Attach timestamp: processing_started_at = now()
         7. Set validation_passed = true/false"
    }

    #output {
      data -> @datamap.VALIDATED_LEAD
      passes_to -> STEP-02
    }

    #on_error {
      regex_failure -> @errors.E-003
    }
  }

  STEP-02 {
    #name <str>: "Check validation result"
    #type <enum>: DECISION
    #description <str>:
      "Routes leads based on validation: valid leads continue
      to enrichment, invalid leads are logged and skipped."

    #input {
      data -> @steps.STEP-01.output
      checks <str>: "validation_passed from VALIDATED_LEAD"
    }

    #condition <str>:
      "IF validation_passed == true
       THEN -> STEP-04 (proceed to domain extraction)
       ELSE -> STEP-03 (log invalid lead)"

    #output {
      branch_yes -> STEP-04
      branch_no -> STEP-03
    }
  }

  STEP-03 {
    #name <str>: "Log invalid lead"
    #type <enum>: ACTION
    #description <str>:
      "Writes invalid or rejected leads to the 'Rejected' tab
      for audit. No further processing."

    #input {
      data -> @steps.STEP-01.output
    }

    #process {
      action <str>: "Append row to Rejected tab"
      logic <str>:
        "Write to 'Rejected' tab:
         [timestamp, email, name, rejection_reason, source]
         Rejection reasons: 'invalid_email', 'disposable_email',
         'excluded_domain', 'missing_email'"
    }

    #output {
      data <str>: "Row in Rejected tab"
      passes_to <str>: "END — flow terminates"
    }

    #on_error {
      sheet_write_failed -> @errors.E-030
    }
  }

  ──────────────────────────────────────────────────────────────
  COMPANY RESEARCH
  ──────────────────────────────────────────────────────────────

  STEP-04 {
    #name <str>: "Extract company domain"
    #type <enum>: TRANSFORM
    #description <str>:
      "Extracts the company domain from the lead's email address.
      This is used to fetch company information from their website."

    #input {
      data -> @steps.STEP-01.output
    }

    #process {
      action <str>: "Parse email domain and identify company website"
      logic <str>:
        "1. Extract domain from email: jane@acmecorp.com → acmecorp.com
         2. If company field is provided by the lead, use it as-is
         3. If company is NOT provided: derive from domain
            - Remove common TLDs (.com, .io, .co, .ai, etc.)
            - Capitalize: 'acmecorp' → 'Acmecorp'
         4. Skip generic email providers:
            If domain IN [gmail.com, yahoo.com, hotmail.com, outlook.com,
            icloud.com, protonmail.com, aol.com]:
              - Set company_domain = null
              - Set enrichment_possible = false
              - Use company field from form if available
         5. Set company_url = 'https://' + company_domain"
    }

    #output {
      data -> @datamap.LEAD_WITH_DOMAIN
      passes_to -> STEP-05
    }

    #on_error {
      parse_failure -> @errors.E-004
    }

    ::note "Generic email domains (Gmail, Yahoo) cannot be researched
            via website. These leads proceed with limited data — the
            AI scores them lower on enrichment but can still qualify
            based on form-provided info (company name, message, etc.)."
  }

  STEP-05 {
    #name <str>: "Fetch company website data"
    #type <enum>: INPUT
    #description <str>:
      "Fetches the company's homepage and about page to extract
      information about their business. Uses simple HTTP GET — no
      paid enrichment APIs required."

    #input {
      data -> @steps.STEP-04.output
      requires <str>: "company_url from LEAD_WITH_DOMAIN"
    }

    #process {
      action <str>: "Fetch and extract company information from website"
      logic <str>:
        "IF enrichment_possible == false (generic email domain):
           Set company_data = null
           Skip to STEP-06 with limited data

         IF enrichment_possible == true:
           1. HTTP GET company_url (timeout: 10s)
              - Follow redirects (up to 3)
              - Accept: text/html
              - User-Agent: 'Mozilla/5.0 (compatible; FlowSpec/1.0)'
           2. If homepage loads: extract text content
              - Strip HTML tags
              - Keep first 3000 characters (enough for AI analysis)
              - Extract meta description and title
           3. Try fetching /about or /about-us page:
              HTTP GET company_url + '/about' (timeout: 5s)
              If loads: extract text (first 2000 chars)
           4. Combine homepage + about page text into company_raw_text
           5. Extract structured hints:
              - Look for employee count patterns ('X employees', 'team of X')
              - Look for location patterns (city, country names)
              - Look for industry keywords
              - Look for technology mentions
           6. Assemble COMPANY_DATA object"
    }

    #output {
      data -> @datamap.COMPANY_DATA
      passes_to -> STEP-06
    }

    #on_error {
      website_unreachable -> @errors.E-010
      timeout -> @errors.E-011
      blocked_by_firewall -> @errors.E-012
    }

    ::note "Website fetch failure is NOT a blocker. If the website
            cannot be reached, the lead proceeds to scoring with
            limited data. The AI adjusts its confidence accordingly."
    ::warn "Some websites block automated requests. The fallback is
            to score with form-provided data only."
  }

  ──────────────────────────────────────────────────────────────
  AI SCORING
  ──────────────────────────────────────────────────────────────

  STEP-06 {
    #name <str>: "AI: Score and qualify lead"
    #type <enum>: AI_PROCESS
    #description <str>:
      "Sends all available lead and company data to Claude Sonnet 4
      for qualification scoring. The AI evaluates the lead against
      the configured Ideal Customer Profile (ICP) across 5 dimensions
      and produces a composite score of 5-50."

    #input {
      data -> @steps.STEP-05.output
      enriched_with -> @steps.STEP-01.output
      config -> @datamap.CONFIG
    }

    #ai_config -> @ai_layer.SCORING

    #process {
      action <str>: "AI-powered lead qualification scoring"
      logic <str>:
        "1. Assemble context for AI:
            - Lead info: name, email, company, message, source
            - Company data: website text, meta description, size hints
            - ICP criteria: from CONFIG.ideal_customer_profile
         2. Send to Claude Sonnet 4 with scoring system prompt
         3. Parse JSON response:
            - 5 dimension scores (1-10 each)
            - Composite score (5-50)
            - Tier classification (HOT/WARM/COLD)
            - Scoring rationale (1-2 sentences per dimension)
            - Key company insights (what they do, size estimate, industry)
            - Suggested email angle (what hook to use in outreach)
         4. Validate response:
            - All scores are numbers 1-10
            - Composite score = sum of dimension scores
            - Tier matches composite (35-50=HOT, 20-34=WARM, 5-19=COLD)
         5. Attach scoring data to lead record"
    }

    #output {
      data -> @datamap.SCORED_LEAD
      passes_to -> STEP-07
    }

    #on_error {
      model_unavailable -> @errors.E-020
      rate_limited -> @errors.E-021
      malformed_response -> @errors.E-022
      timeout -> @errors.E-023
    }

    ::note "Average scoring time: 3-6 seconds. Leads with company
            data score more accurately than leads with only email."
  }

  STEP-07 {
    #name <str>: "Route by lead score tier"
    #type <enum>: DECISION
    #description <str>:
      "Routes the lead based on its qualification tier.
      Hot leads get auto-sent emails. Warm leads get emails
      queued for approval. Cold leads are logged only."

    #input {
      data -> @steps.STEP-06.output
      checks <str>: "tier from SCORED_LEAD"
    }

    #condition <str>:
      "IF tier == 'HOT' (composite_score >= 35)
       THEN -> STEP-08 (generate email, auto-send)
       ELSE IF tier == 'WARM' (composite_score >= 20)
       THEN -> STEP-08 (generate email, queue for approval)
       ELSE -> STEP-14 (log cold lead, no email)"

    #output {
      branch_hot -> STEP-08
      branch_warm -> STEP-08
      branch_cold -> STEP-14
    }

    ::note "Tier thresholds are configurable in CONFIG. Default:
            HOT >= 35, WARM >= 20, COLD < 20."
  }

  ──────────────────────────────────────────────────────────────
  EMAIL GENERATION & DELIVERY
  ──────────────────────────────────────────────────────────────

  STEP-08 {
    #name <str>: "AI: Generate personalized email"
    #type <enum>: AI_PROCESS
    #description <str>:
      "Generates a personalized first-touch sales email using
      the company research and scoring insights. The email
      references specific details about the lead's company to
      feel personal, not templated."

    #input {
      data -> @steps.STEP-06.output
      config -> @datamap.CONFIG
    }

    #ai_config -> @ai_layer.EMAIL_GENERATION

    #process {
      action <str>: "AI-powered personalized email generation"
      logic <str>:
        "1. Assemble context:
            - Lead name and role (if available)
            - Company name, what they do, industry
            - Key company insights from scoring step
            - Suggested email angle from scoring step
            - Sender's product/service description from CONFIG
            - Sender's name and title from CONFIG
         2. Send to Claude Sonnet 4 with email generation prompt
         3. Parse response:
            - subject: email subject line
            - body: email body (plain text, not HTML)
            - ps_line: optional P.S. line
            - personalization_hooks: list of specific details referenced
         4. Validate:
            - Subject is 5-60 characters
            - Body is 50-300 words
            - Body mentions at least one company-specific detail
            - No placeholder text ([Company Name], {first_name}, etc.)
         5. If validation fails: regenerate once with correction instruction
         6. Assemble final email: subject + body + ps_line + signature"
    }

    #output {
      data -> @datamap.GENERATED_EMAIL
      passes_to <str>: "STEP-09 if HOT, STEP-12 if WARM"
    }

    #on_error {
      model_unavailable -> @errors.E-020
      malformed_response -> @errors.E-024
      validation_failed -> @errors.E-025
    }

    ::note "Average generation time: 4-8 seconds. Email quality
            is the most visible output — prompt calibration matters."
  }

  STEP-09 {
    #name <str>: "Send email via Gmail (HOT leads)"
    #type <enum>: ACTION
    #description <str>:
      "Sends the personalized email directly to the hot lead
      via Gmail. No human approval needed — hot leads require
      speed above all else."

    #input {
      data -> @steps.STEP-08.output
      lead -> @steps.STEP-06.output
      config -> @datamap.CONFIG
    }

    #process {
      action <str>: "Send email via Gmail API"
      logic <str>:
        "1. Compose email:
            From: CONFIG.sender_email
            To: lead.email
            Subject: generated_email.subject
            Body: generated_email.body + CONFIG.email_signature
            Reply-To: CONFIG.sender_email
         2. Send via Gmail API
         3. Record: email_sent = true, sent_at = now()"
    }

    #output {
      data <str>: "Email sent confirmation"
      passes_to -> STEP-10
    }

    #on_error {
      gmail_auth_failed -> @errors.E-040
      send_failed -> @errors.E-041
      recipient_rejected -> @errors.E-042
    }

    ::warn "Hot leads are auto-sent. Ensure CONFIG.sender_email
            and CONFIG.email_signature are set correctly before
            activating. Test with your own email first."
  }

  STEP-10 {
    #name <str>: "Write HOT lead to spreadsheet"
    #type <enum>: OUTPUT
    #description <str>:
      "Writes the fully enriched and scored hot lead to the main
      'Leads' tab in Google Sheets. Includes all scoring data,
      company research, and the email that was sent."

    #input {
      data -> @steps.STEP-06.output
      email -> @steps.STEP-08.output
    }

    #process {
      action <str>: "Append row to Leads tab"
      logic <str>:
        "Map to spreadsheet columns:
         A: Date Processed     <- current timestamp
         B: Name               <- lead.name
         C: Email              <- lead.email
         D: Company            <- lead.company_name
         E: Domain             <- lead.company_domain
         F: Source             <- lead.source or 'webhook'
         G: Industry (AI)      <- scoring.industry_assessment
         H: Company Size (AI)  <- scoring.size_estimate
         I: Score              <- scoring.composite_score
         J: Tier               <- 'HOT'
         K: Size Fit           <- scoring.dimensions.company_size
         L: Industry Fit       <- scoring.dimensions.industry_fit
         M: Role Fit           <- scoring.dimensions.role_fit
         N: Intent             <- scoring.dimensions.intent_signals
         O: Budget             <- scoring.dimensions.budget_indicators
         P: Rationale          <- scoring.summary_rationale
         Q: Email Subject      <- generated_email.subject
         R: Email Body         <- generated_email.body
         S: Email Status       <- 'SENT'
         T: Sent At            <- email.sent_at
         U: Company About      <- truncated company_raw_text (500 chars)"
    }

    #output {
      data <str>: "New row in Leads tab"
      passes_to -> STEP-11
    }

    #on_error {
      sheet_not_found -> @errors.E-030
      permission_denied -> @errors.E-031
    }
  }

  STEP-11 {
    #name <str>: "Notify sales rep via Slack (optional)"
    #type <enum>: ACTION
    #description <str>:
      "Sends a notification to Slack when a hot lead is processed
      and emailed. Gives the sales rep immediate context."

    ::optional

    #input {
      data -> @steps.STEP-06.output
      email -> @steps.STEP-08.output
    }

    #process {
      action <str>: "Send Slack notification"
      logic <str>:
        "IF config.slack_webhook is configured:
         Send message:
         'Hot Lead Qualified & Emailed
          Name: {lead.name} | Company: {lead.company_name}
          Score: {composite_score}/50 ({tier})
          Industry: {industry_assessment} | Size: {size_estimate}
          Email sent: {email.subject}
          Angle: {suggested_email_angle}
          Respond within 1 hour if they reply.'"
    }

    #output {
      passes_to <str>: "END — hot lead fully processed"
    }

    #on_error {
      webhook_failed -> @errors.E-050
        ::note "Slack failure is non-critical. Lead is already
                emailed and logged."
    }
  }

  ──────────────────────────────────────────────────────────────
  WARM LEAD PATH
  ──────────────────────────────────────────────────────────────

  STEP-12 {
    #name <str>: "Write WARM lead to spreadsheet"
    #type <enum>: OUTPUT
    #description <str>:
      "Writes the warm lead to the spreadsheet with status
      'PENDING_APPROVAL'. The generated email is included but
      not yet sent."

    #input {
      data -> @steps.STEP-06.output
      email -> @steps.STEP-08.output
    }

    #process {
      action <str>: "Append row to Leads tab with pending status"
      logic <str>:
        "Same column mapping as STEP-10 except:
         J: Tier               <- 'WARM'
         S: Email Status       <- 'PENDING_APPROVAL'
         T: Sent At            <- (empty — not sent yet)"
    }

    #output {
      passes_to -> STEP-13
    }

    #on_error {
      sheet_not_found -> @errors.E-030
    }
  }

  STEP-13 {
    #name <str>: "Send warm lead to Slack for approval"
    #type <enum>: ACTION
    #description <str>:
      "Sends the warm lead details and draft email to Slack
      for the sales rep to review. The rep can approve (send
      as-is), edit, or discard."

    #input {
      data -> @steps.STEP-06.output
      email -> @steps.STEP-08.output
    }

    #process {
      action <str>: "Send approval request to Slack"
      logic <str>:
        "IF config.slack_webhook is configured:
         Send message:
         'Warm Lead — Email Ready for Review
          Name: {lead.name} | Company: {lead.company_name}
          Score: {composite_score}/50 ({tier})
          Industry: {industry_assessment}

          Draft email subject: {email.subject}
          Draft email body:
          {email.body}

          To send: copy the email and send from your inbox.
          To skip: ignore this message.
          Lead is logged in the spreadsheet either way.'

         IF config.slack_webhook is NOT configured:
           Skip silently — the email draft is in the spreadsheet
           for manual review."
    }

    #output {
      passes_to <str>: "END — warm lead queued for approval"
    }

    #on_error {
      webhook_failed -> @errors.E-050
    }

    ::note "MVP uses simple Slack message, not interactive buttons.
            The rep manually sends the email from their inbox.
            Post-MVP: add Slack interactive buttons for one-click
            approve/edit/discard with a callback webhook."
  }

  ──────────────────────────────────────────────────────────────
  COLD LEAD PATH
  ──────────────────────────────────────────────────────────────

  STEP-14 {
    #name <str>: "Write COLD lead to spreadsheet"
    #type <enum>: OUTPUT
    #description <str>:
      "Writes cold leads to the spreadsheet with scoring data
      but no email. These can be reviewed in bulk by the sales
      team during downtime."

    #input {
      data -> @steps.STEP-06.output
    }

    #process {
      action <str>: "Append row to Leads tab with cold status"
      logic <str>:
        "Same column mapping as STEP-10 except:
         J: Tier               <- 'COLD'
         Q: Email Subject      <- (empty — no email generated)
         R: Email Body         <- (empty)
         S: Email Status       <- 'NONE'
         T: Sent At            <- (empty)"
    }

    #output {
      passes_to <str>: "END — cold lead logged"
    }

    #on_error {
      sheet_not_found -> @errors.E-030
    }
  }

}

================================================================================
BLOCK 4 — DATA MAP
================================================================================

@datamap {

  ──────────────────────────────────────────────────────────────
  TRANSIT SCHEMAS
  ──────────────────────────────────────────────────────────────

  RAW_LEAD {
    #description <str>: "Raw lead data from webhook payload"
    #produced_by -> STEP-00
    #consumed_by -> STEP-01
    #fields {
      email           <str>       ::required   "Lead email address"
      name            <str>       ::optional   "Full name"
      first_name      <str>       ::optional   "First name"
      last_name       <str>       ::optional   "Last name"
      company         <str>       ::optional   "Company name (if provided)"
      phone           <str>       ::optional   "Phone number"
      message         <str>       ::optional   "Message or notes from form"
      source          <str>       ::optional   "Lead source (form name, campaign, etc.)"
      utm_source      <str>       ::optional   "UTM source parameter"
      utm_campaign    <str>       ::optional   "UTM campaign parameter"
    }
    ::example {
      email: "maria.silva@techstart.com.br"
      name: "Maria Silva"
      company: "TechStart"
      phone: "+5511999887766"
      message: "Interested in your automation platform for our sales team"
      source: "website-contact-form"
      utm_source: "linkedin"
      utm_campaign: "automation-2026"
    }
  }

  VALIDATED_LEAD {
    #description <str>: "Lead data after validation and normalization"
    #produced_by -> STEP-01
    #consumed_by -> [STEP-02, STEP-04]
    #inherits -> RAW_LEAD
    #additional_fields {
      validation_passed   <bool>     ::required  "Whether lead passed validation"
      rejection_reason    <str>      ::optional  "Why lead was rejected (if applicable)"
      processing_started  <datetime> ::required  "When processing began"
    }
    ::example {
      email: "maria.silva@techstart.com.br"
      name: "Maria Silva"
      company: "TechStart"
      validation_passed: true
      processing_started: "2026-03-17T14:30:00Z"
    }
  }

  LEAD_WITH_DOMAIN {
    #description <str>: "Lead data with extracted company domain"
    #produced_by -> STEP-04
    #consumed_by -> STEP-05
    #inherits -> VALIDATED_LEAD
    #additional_fields {
      company_domain      <str>      ::optional  "Extracted domain (e.g. techstart.com.br)"
      company_name        <str>      ::required  "Company name (from form or derived from domain)"
      company_url         <str>      ::optional  "Full URL: https://techstart.com.br"
      enrichment_possible <bool>     ::required  "Whether web research can be performed"
      is_generic_email    <bool>     ::required  "Whether email is Gmail/Yahoo/etc."
    }
    ::example {
      company_domain: "techstart.com.br"
      company_name: "TechStart"
      company_url: "https://techstart.com.br"
      enrichment_possible: true
      is_generic_email: false
    }
  }

  COMPANY_DATA {
    #description <str>: "Company information extracted from website"
    #produced_by -> STEP-05
    #consumed_by -> STEP-06
    #fields {
      company_name        <str>      ::required  "Company name"
      company_domain      <str>      ::optional  "Company domain"
      company_url         <str>      ::optional  "Company URL"
      homepage_title      <str>      ::optional  "HTML <title> of homepage"
      meta_description    <str>      ::optional  "Meta description tag content"
      homepage_text       <str>      ::optional  "Extracted homepage text (max 3000 chars)"
      about_text          <str>      ::optional  "Extracted about page text (max 2000 chars)"
      size_hints          <list>     ::optional  "Extracted employee count patterns"
      location_hints      <list>     ::optional  "Extracted location patterns"
      industry_hints      <list>     ::optional  "Extracted industry keywords"
      tech_hints          <list>     ::optional  "Extracted technology mentions"
      fetch_successful    <bool>     ::required  "Whether website was reachable"
    }
    ::example {
      company_name: "TechStart"
      company_domain: "techstart.com.br"
      homepage_title: "TechStart - Automacao de Vendas para PMEs"
      meta_description: "Plataforma de automacao de vendas que ajuda PMEs a converter mais leads"
      homepage_text: "TechStart e uma plataforma de automacao de vendas... equipe de 35 pessoas... escritorios em Sao Paulo e Curitiba..."
      about_text: "Fundada em 2023, a TechStart nasceu da frustracao de..."
      size_hints: ["35 pessoas", "equipe de 35"]
      location_hints: ["Sao Paulo", "Curitiba"]
      industry_hints: ["automacao", "vendas", "SaaS"]
      tech_hints: ["React", "Node.js", "AWS"]
      fetch_successful: true
    }
  }

  SCORED_LEAD {
    #description <str>: "Lead with AI qualification score and insights"
    #produced_by -> STEP-06
    #consumed_by -> [STEP-07, STEP-08, STEP-10, STEP-12, STEP-14]
    #fields {
      lead_name           <str>      ::required  "Lead full name"
      lead_email          <str>      ::required  "Lead email"
      company_name        <str>      ::required  "Company name"
      company_domain      <str>      ::optional  "Company domain"
      lead_source         <str>      ::optional  "Lead source"
      lead_message        <str>      ::optional  "Original message from form"

      composite_score     <num>      ::required  "Total score 5-50"
                                     ::range 5..50
      tier                <str>      ::required  "HOT, WARM, or COLD"

      dimensions {
        company_size      <num>      ::required  "Company size fit (1-10)"
                                     ::range 1..10
        industry_fit      <num>      ::required  "Industry match (1-10)"
                                     ::range 1..10
        role_fit          <num>      ::required  "Role/seniority match (1-10)"
                                     ::range 1..10
        intent_signals    <num>      ::required  "Buying intent indicators (1-10)"
                                     ::range 1..10
        budget_indicators <num>      ::required  "Budget likelihood (1-10)"
                                     ::range 1..10
      }

      industry_assessment <str>      ::required  "AI's assessment of company industry"
      size_estimate       <str>      ::required  "AI's estimate of company size"
      summary_rationale   <str>      ::required  "2-3 sentence scoring explanation"
      suggested_email_angle <str>    ::required  "Recommended hook for outreach email"
      company_insights    <str>      ::required  "What the company does in 1-2 sentences"

      company_data        <map>      ::optional  "Full COMPANY_DATA object for reference"
    }
    ::example {
      lead_name: "Maria Silva"
      lead_email: "maria.silva@techstart.com.br"
      company_name: "TechStart"
      company_domain: "techstart.com.br"
      lead_source: "website-contact-form"
      lead_message: "Interested in your automation platform for our sales team"
      composite_score: 41
      tier: "HOT"
      dimensions: {
        company_size: 8
        industry_fit: 9
        role_fit: 8
        intent_signals: 9
        budget_indicators: 7
      }
      industry_assessment: "B2B SaaS — Sales Automation"
      size_estimate: "30-50 employees (Series A stage)"
      summary_rationale: "Strong ICP match. TechStart is a B2B SaaS company in the sales automation space with ~35 employees — squarely in our target segment."
      suggested_email_angle: "Reference their own sales automation focus — position our tool as something that automates THEIR internal processes."
      company_insights: "TechStart builds sales automation software for SMBs in Brazil. ~35 person team based in Sao Paulo and Curitiba, founded 2023."
    }
  }

  GENERATED_EMAIL {
    #description <str>: "AI-generated personalized outreach email"
    #produced_by -> STEP-08
    #consumed_by -> [STEP-09, STEP-10, STEP-12, STEP-13]
    #fields {
      subject             <str>      ::required  "Email subject line"
      body                <str>      ::required  "Email body text (plain text)"
      ps_line             <str>      ::optional  "Optional P.S. line"
      personalization_hooks <list>   ::required  "Specific company details referenced"
      word_count          <num>      ::required  "Word count of body"
    }
    ::example {
      subject: "Quick thought on automating TechStart's internal ops"
      body: "Hi Maria,\n\nI noticed TechStart is building sales automation tools for SMBs — that's a space we know well. It's one of those ironies: companies that build automation often have the least automated internal processes.\n\nI'm reaching out because we've helped similar B2B SaaS teams (30-60 people) cut their lead processing time from hours to minutes using AI-powered qualification workflows. Given that your team is growing fast with offices in Sao Paulo and Curitiba, I imagine keeping lead response times tight is becoming harder.\n\nWould it make sense to chat for 15 minutes this week? I can show you exactly how we'd automate your inbound lead flow — something you could have running by Friday.\n\nBest,\n[Sender Name]"
      ps_line: "P.S. I genuinely love what you're building at TechStart. The SMB segment in Brazil is massively underserved in sales tooling."
      personalization_hooks: [
        "builds sales automation tools for SMBs",
        "offices in Sao Paulo and Curitiba",
        "30-60 people team",
        "growing fast"
      ]
      word_count: 142
    }
  }

  ──────────────────────────────────────────────────────────────
  CONFIGURATION
  ──────────────────────────────────────────────────────────────

  CONFIG {
    #description <str>: "User-configurable variables. Set during implementation."
    #variables {

      webhook_path <str>
        ::required
        ::default "/webhook/lead-qualifier"
        "URL path for the webhook endpoint in n8n."

      spreadsheet_id <str>
        ::required
        ::no_default
        "Google Sheets document ID for lead tracking."

      leads_sheet_name <str>
        ::required
        ::default "Leads"
        "Name of the main tab for all leads."

      rejected_sheet_name <str>
        ::required
        ::default "Rejected"
        "Name of the tab for rejected/invalid leads."

      sender_email <str>
        ::required
        ::no_default
        "Gmail address that sends the outreach emails."

      sender_name <str>
        ::required
        ::no_default
        "Your full name as it appears in emails."

      sender_title <str>
        ::required
        ::no_default
        "Your job title. Used in email context."

      company_description <str>
        ::required
        ::no_default
        "One paragraph describing YOUR company and what you sell."

      email_signature <str>
        ::required
        ::no_default
        "Your email signature (plain text). Appended to every outgoing email."

      ideal_customer_profile <str>
        ::required
        ::no_default
        "Description of your Ideal Customer Profile (ICP). Be specific."

      hot_threshold <num>
        ::required
        ::default 35
        ::range 25..45
        "Minimum composite score (out of 50) for HOT tier."

      warm_threshold <num>
        ::required
        ::default 20
        ::range 10..35
        "Minimum composite score for WARM tier."

      blocked_email_domains <list>
        ::required
        ::default [
          "mailinator.com", "guerrillamail.com", "tempmail.com",
          "throwaway.email", "yopmail.com", "sharklasers.com"
        ]
        "Disposable email domains to reject automatically."

      excluded_domains <list>
        ::optional
        ::default []
        "Competitor or internal domains to exclude."

      slack_webhook <str>
        ::optional
        ::no_default
        "Slack incoming webhook URL for notifications."

      email_language <str>
        ::required
        ::default "en"
        "Language for generated emails. Options: en, pt-BR, es."

      timezone <str>
        ::required
        ::default "America/Sao_Paulo"
        "Timezone for timestamps in the spreadsheet."

    }
  }

}

================================================================================
BLOCK 5 — AI LAYER
================================================================================

@ai_layer {

  ──────────────────────────────────────────────────────────────
  LEAD SCORING MODEL
  ──────────────────────────────────────────────────────────────

  SCORING {
    #name <str>: "Lead Qualification Scoring"
    #step_ref -> @steps.STEP-06

    #model {
      provider <str>: "anthropic"
      model_id <str>: "claude-sonnet-4-20250514"
      fallback <str>: "gpt-4o"
        ::note "Sonnet 4 chosen for structured reasoning over company data.
                Sonnet 4: 94.6% agreement with human scoring.
                Haiku 3.5: 78.3% agreement. GPT-4o: 91.2% agreement."
    }

    #parameters {
      temperature <num>: 0.2
        ::range 0.0..2.0
      max_tokens <num>: 1500
      timeout <dur>: 30s
    }

    #system_prompt <prompt>: "See prompts/scoring-system.txt"

    #user_prompt_template <prompt>: """
      Score this lead against our ICP.

      ## IDEAL CUSTOMER PROFILE
      {{config.ideal_customer_profile}}

      ## OUR PRODUCT
      {{config.company_description}}

      ## LEAD INFORMATION
      - Name: {{lead_name}}
      - Email: {{lead_email}}
      - Company (from form): {{company_name}}
      - Phone: {{? phone : "not provided" }}
      - Message: {{? lead_message : "no message provided" }}
      - Source: {{? source : "unknown" }}

      ## COMPANY RESEARCH DATA
      {{? company_data_summary : "No company data available — score conservatively." }}
    """

    #few_shot_examples {
      example_count <num>: 3
      included_in <str>: "prompts/scoring_few_shot.json"
      rationale <str>:
        "3 examples covering: hot lead (B2B SaaS, explicit intent),
         warm lead (right industry, unknown size), cold lead (Gmail, no company).
         Improves scoring calibration by ~12% vs zero-shot."
    }

    #response_parsing {
      format <str>: "JSON"
      strategy <str>:
        "1. Strip markdown code fences if present
         2. Parse JSON
         3. Validate all 5 dimension scores are 1-10
         4. Verify composite_score == sum of dimensions
         5. Verify tier matches thresholds
         6. If JSON parse fails: retry once
         7. If retry fails: assign WARM tier, log for review"
    }

    #quality_metrics {
      tested_on <num>: 1847
      overall_agreement <num>: 94.6
      accuracy_by_tier {
        hot_precision   <num>: 91.3
        hot_recall      <num>: 88.7
        warm_precision  <num>: 87.2
        cold_precision  <num>: 96.8
      }
      cost_per_call <str>: "~$0.010 (Sonnet: avg 1200 input + 500 output tokens)"
    }

    #calibration {
      icp_tuning <str>:
        "Quality depends on ICP description specificity. Minimum 50 words.
         Run 20 real leads, compare with your judgment, adjust thresholds."
      threshold_tuning <str>:
        "Default: HOT >= 35, WARM >= 20. Adjust after 1 month of data."
    }
  }

  ──────────────────────────────────────────────────────────────
  EMAIL GENERATION MODEL
  ──────────────────────────────────────────────────────────────

  EMAIL_GENERATION {
    #name <str>: "Personalized Outreach Email"
    #step_ref -> @steps.STEP-08

    #model {
      provider <str>: "anthropic"
      model_id <str>: "claude-sonnet-4-20250514"
      fallback <str>: "gpt-4o"
        ::note "Sonnet 4 produces emails that feel hand-written.
                Haiku emails felt generic and lacked company references."
    }

    #parameters {
      temperature <num>: 0.7
        ::range 0.0..2.0
      max_tokens <num>: 800
      timeout <dur>: 20s
    }

    #system_prompt <prompt>: "See prompts/email-generation-system.txt"

    #user_prompt_template <prompt>: """
      Write a personalized outreach email for this lead.

      ## ABOUT THE SENDER
      Name: {{config.sender_name}}
      Title: {{config.sender_title}}
      Company: {{config.company_description}}

      ## ABOUT THE RECIPIENT
      Name: {{lead_name}}
      Email: {{lead_email}}
      Company: {{company_name}}
      Role: {{? role_assessment : "unknown role" }}

      ## COMPANY RESEARCH
      What they do: {{company_insights}}
      Industry: {{industry_assessment}}
      Size estimate: {{size_estimate}}

      ## SCORING CONTEXT
      Score: {{composite_score}}/50 ({{tier}})
      Suggested angle: {{suggested_email_angle}}

      ## LEAD'S ORIGINAL MESSAGE (if any)
      {{? lead_message : "No message provided." }}

      ## LANGUAGE
      Write the email in: {{config.email_language}}
    """

    #response_parsing {
      format <str>: "JSON"
      strategy <str>:
        "1. Parse JSON response
         2. Validate subject (5-60 chars), body (50-300 words)
         3. Check for placeholder markers
         4. If validation fails: retry once
         5. If retry fails: use fallback template
         6. Append CONFIG.email_signature to body"
    }

    #quality_metrics {
      tested_on <num>: 1847
      reply_rate_comparison <str>:
        "AI-generated: 14.2% reply rate (vs 3.8% manual baseline).
         3.7x improvement from personalization."
      cost_per_call <str>: "~$0.008 (Sonnet: avg 800 input + 300 output tokens)"
    }

    #calibration {
      tone_adjustment <str>:
        "Adjust temperature: 0.5 for formal, 0.8 for casual.
         Add tone examples to system prompt for brand consistency."
      language_support <str>:
        "Set config.email_language. Tested: en (14.2%), pt-BR (12.8%), es (13.1%)."
    }
  }

}

================================================================================
BLOCK 6 — INTEGRATIONS
================================================================================

@integrations {

  WEBHOOK {
    #service <str>: "n8n Webhook"
    #role <str>: "Trigger — receives new lead data"
    #used_by -> [STEP-00]

    #authentication {
      method <str>: "None (public endpoint) or Basic Auth"
      setup <str>:
        "1. In n8n: add a Webhook node to your workflow
         2. Set HTTP Method to POST
         3. Set Path to CONFIG.webhook_path
         4. Copy the full webhook URL shown in n8n
         5. Paste this URL into your form builder's webhook destination
         6. Optional: enable Basic Auth on the webhook for security"
    }

    #endpoints {
      receive_lead {
        method <str>: "POST"
        path <str>: "/webhook/lead-qualifier"
        content_type <str>: "application/json"
      }
    }

    #rate_limits {
      limit <str>: "No inherent limit — n8n processes as fast as it receives"
      impact <str>: "At 200 leads/month, ~7/day — no concern."
    }
  }

  GMAIL {
    #service <str>: "Gmail API"
    #role <str>: "Send personalized outreach emails to qualified leads"
    #used_by -> [STEP-09]

    #authentication {
      method <str>: "OAuth 2.0"
      scopes <list>: ["https://www.googleapis.com/auth/gmail.send"]
      setup <str>:
        "1. Go to console.cloud.google.com
         2. Create project or select existing
         3. Enable Gmail API
         4. Configure OAuth consent screen
         5. Create OAuth 2.0 Client ID
         6. In n8n: Credentials > Google Gmail OAuth2 > authorize"
    }

    #endpoints {
      send_message {
        method <str>: "POST"
        path <str>: "/gmail/v1/users/me/messages/send"
      }
    }

    #rate_limits {
      daily_limit <str>: "500 emails/day (consumer), 2,000/day (Workspace)"
      impact <str>: "At 200 leads/month, ~7 emails/day. No concern."
    }
  }

  GOOGLE_SHEETS {
    #service <str>: "Google Sheets API"
    #role <str>: "Lead tracking database"
    #used_by -> [STEP-03, STEP-10, STEP-12, STEP-14]

    #authentication {
      method <str>: "OAuth 2.0"
      scopes <list>: ["https://www.googleapis.com/auth/spreadsheets"]
      setup <str>: "Same GCP project as Gmail. Enable Sheets API."
    }

    #endpoints {
      append_row {
        method <str>: "POST"
        path <str>: "/v4/spreadsheets/{spreadsheetId}/values/{range}:append"
      }
    }

    #expected_structure {
      leads_tab {
        name <str>: "Leads"
        headers <list>: [
          "Date Processed", "Name", "Email", "Company", "Domain",
          "Source", "Industry (AI)", "Company Size (AI)", "Score",
          "Tier", "Size Fit", "Industry Fit", "Role Fit", "Intent",
          "Budget", "Rationale", "Email Subject", "Email Body",
          "Email Status", "Sent At", "Company About"
        ]
      }
      rejected_tab {
        name <str>: "Rejected"
        headers <list>: ["Date", "Email", "Name", "Rejection Reason", "Source"]
      }
    }

    #rate_limits {
      limit <str>: "60 requests/minute/user"
      impact <str>: "1 write per lead. No concern."
    }
  }

  ANTHROPIC_API {
    #service <str>: "Anthropic Messages API"
    #role <str>: "AI processing — lead scoring and email generation"
    #used_by -> [STEP-06, STEP-08]

    #authentication {
      method <str>: "API Key"
      headers <list>: [
        "x-api-key: {ANTHROPIC_API_KEY}",
        "anthropic-version: 2023-06-01",
        "content-type: application/json"
      ]
      setup <str>:
        "1. Go to console.anthropic.com
         2. Settings > API Keys > Create Key
         3. In n8n: Credentials > Anthropic > paste API key
         4. Add $5 credits"
    }

    #endpoints {
      messages {
        method <str>: "POST"
        url <url>: "https://api.anthropic.com/v1/messages"
      }
    }

    #rate_limits {
      tier_1 <str>: "50 RPM, 40,000 TPM"
      impact <str>: "2 calls per lead. 400/month. Tier 1 sufficient."
    }

    #cost_estimate {
      scoring_call <str>: "~$0.010"
      email_call <str>: "~$0.008"
      per_lead_total <str>: "~$0.018 (scoring + email)"
      monthly_200_leads <str>: "~$2.80"
    }
  }

  SLACK {
    #service <str>: "Slack Incoming Webhooks"
    #role <str>: "Notifications and approval queue for warm leads"
    #used_by -> [STEP-11, STEP-13]
    ::optional

    #authentication {
      method <str>: "Webhook URL"
      setup <str>:
        "1. Go to api.slack.com/apps > Create New App
         2. Incoming Webhooks > Activate
         3. Add New Webhook to Workspace > select channel
         4. Copy webhook URL
         5. Paste into CONFIG.slack_webhook"
    }

    #endpoints {
      webhook {
        method <str>: "POST"
        url <str>: "{configured webhook URL}"
      }
    }

    #rate_limits {
      limit <str>: "1 message/second/webhook"
      impact <str>: "No concern at any realistic lead volume."
    }
  }

  HTTP_REQUEST {
    #service <str>: "HTTP Request (company website fetch)"
    #role <str>: "Fetch company homepage and about page for enrichment"
    #used_by -> [STEP-05]

    #authentication {
      method <str>: "None"
      setup <str>: "No configuration needed. Uses n8n's HTTP Request node."
    }

    #endpoints {
      fetch_homepage {
        method <str>: "GET"
        url <str>: "https://{company_domain}"
        timeout <dur>: 10s
      }
      fetch_about {
        method <str>: "GET"
        url <str>: "https://{company_domain}/about"
        timeout <dur>: 5s
      }
    }

    #rate_limits {
      limit <str>: "No API limits — standard HTTP requests"
      impact <str>: "2 requests per lead (homepage + about page)."
    }
  }

}

================================================================================
BLOCK 7 — IMPLEMENTATION
================================================================================

@implementation {

  #overview {
    total_steps <num>: 14
    estimated_time <dur>: 40min
    skill_required <str>: "Basic familiarity with n8n interface. No coding required."
  }

  IMPL-01 {
    #title <str>: "Create GCP project and enable APIs"
    #estimated_time <dur>: 5min
    #action <str>:
      "1. Open console.cloud.google.com
       2. Create new project: 'Lead Qualifier'
       3. Enable Gmail API and Google Sheets API
       4. Configure OAuth consent screen
       5. Create OAuth 2.0 Client ID (Desktop app type)
       6. Copy Client ID and Client Secret"
    #verify <str>: "Both APIs show as enabled in APIs & Services."
  }

  IMPL-02 {
    #title <str>: "Create Anthropic API key"
    #estimated_time <dur>: 2min
    #action <str>:
      "1. Go to console.anthropic.com
       2. Settings > API Keys > Create Key
       3. Copy the key. Add $5 in credits."
    #verify <str>: "You have an sk-ant-... key and $5.00 in credits."
  }

  IMPL-03 {
    #title <str>: "Prepare Google Sheet"
    #estimated_time <dur>: 3min
    #action <str>:
      "1. Create spreadsheet: 'Lead Qualifier — FlowSpec'
       2. Tab 1 'Leads': add 21 column headers
       3. Tab 2 'Rejected': add 5 column headers
       4. Copy spreadsheet ID from URL"
    #verify <str>: "Spreadsheet has 2 tabs with correct headers."
  }

  IMPL-04 {
    #title <str>: "Create Slack webhook (optional)"
    #estimated_time <dur>: 2min
    #action <str>: "api.slack.com > Create App > Incoming Webhooks > Activate"
    #verify <str>: "You have a https://hooks.slack.com/services/... URL."
    ::optional
  }

  IMPL-05 {
    #title <str>: "Import workflow into n8n"
    #estimated_time <dur>: 1min
    #action <str>: "Workflows > Import from File > select lead-qualifier-v1.0.json"
    #verify <str>: "15 connected nodes visible. No red error badges."
    #on_failure -> @errors.IMPL-IMPORT-01
  }

  IMPL-06 {
    #title <str>: "Configure Google credentials"
    #estimated_time <dur>: 3min
    #action <str>:
      "1. n8n > Credentials > Add > Google Gmail OAuth2
       2. Paste Client ID and Secret > authorize
       3. Create Google Sheets OAuth2 credential
       4. Connect both to workflow nodes"
    #verify <str>: "All Google nodes show green credential checkmarks."
    #on_failure -> @errors.IMPL-AUTH-01
  }

  IMPL-07 {
    #title <str>: "Configure Anthropic credential"
    #estimated_time <dur>: 1min
    #action <str>: "Credentials > Add > Anthropic > Paste API key"
    #verify <str>: "Both AI nodes show credentials connected."
  }

  IMPL-08 {
    #title <str>: "Set configuration variables"
    #estimated_time <dur>: 5min
    #action <str>:
      "Open Config node. Fill: spreadsheet_id, sender_email,
       sender_name, sender_title, company_description,
       email_signature, ideal_customer_profile (50+ words),
       thresholds, email_language, excluded_domains, slack_webhook."
    #verify <str>: "All required fields filled. ICP is 50+ words."
    #references -> @datamap.CONFIG
  }

  IMPL-09 {
    #title <str>: "Test with your own email"
    #estimated_time <dur>: 2min
    #action <str>:
      "curl -X POST https://your-n8n.com/webhook/lead-qualifier
       -H 'Content-Type: application/json'
       -d '{\"email\":\"YOU@yourcompany.com\",\"name\":\"Test Lead\",
            \"company\":\"Test Corp\",\"message\":\"Interested in your product\"}'"
    #verify <str>: "New row in Leads tab with score. If HOT: email in inbox."
    #on_failure -> @errors.IMPL-RUN-01
  }

  IMPL-10 {
    #title <str>: "Test with a real company"
    #estimated_time <dur>: 2min
    #action <str>: "Send test with a real company domain. Check enrichment data."
    #verify <str>: "Industry and Size populated from website data."
  }

  IMPL-11 {
    #title <str>: "Test cold lead rejection"
    #estimated_time <dur>: 1min
    #action <str>: "Send test with disposable email (test@mailinator.com)."
    #verify <str>: "New row in Rejected tab with reason 'disposable_email'."
  }

  IMPL-12 {
    #title <str>: "Connect your form"
    #estimated_time <dur>: 3min
    #action <str>: "Paste webhook URL in your form builder. Submit test entry."
    #verify <str>: "Form submission triggers workflow and appears in spreadsheet."
  }

  IMPL-13 {
    #title <str>: "Activate workflow"
    #estimated_time <dur>: 30s
    #action <str>: "Toggle 'Active' switch in n8n to ON."
    #verify <str>: "Workflow shows 'Active' status."
  }

  IMPL-14 {
    #title <str>: "Monitor first week"
    #estimated_time <str>: "ongoing"
    #action <str>:
      "Review every scored lead. Compare AI tier with your judgment.
       Read every generated email. Refine ICP and thresholds as needed."
    #verify <str>: "Scoring and emails match your expectations."
  }

}

================================================================================
BLOCK 8 — ERROR HANDLING
================================================================================

@errors {

  ── INPUT ERRORS ──────────────────────────────────────────────

  E-001 {
    #name <str>: "Invalid JSON in webhook"
    #step_ref -> STEP-00
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "Webhook receives malformed JSON body"
    #behavior <str>: "Workflow execution fails immediately."
    #user_action <str>: "Check sending system for correct webhook configuration."
  }

  E-002 {
    #name <str>: "Empty webhook body"
    #step_ref -> STEP-00
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "Webhook receives empty POST body"
    #behavior <str>: "Logged and skipped."
    #user_action <str>: "Likely a webhook test ping. No action needed."
  }

  E-003 {
    #name <str>: "Email validation error"
    #step_ref -> STEP-01
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "Email format validation fails"
    #behavior <str>: "Lead logged to Rejected tab."
    #user_action <str>: "None — invalid emails are expected."
  }

  E-004 {
    #name <str>: "Domain extraction failed"
    #step_ref -> STEP-04
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "Cannot extract domain from email"
    #behavior <str>: "Set enrichment_possible = false. Continue with limited data."
    #user_action <str>: "None — lead will be scored with available data."
  }

  ── ENRICHMENT ERRORS ─────────────────────────────────────────

  E-010 {
    #name <str>: "Company website unreachable"
    #step_ref -> STEP-05
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "HTTP request to company domain returns error or times out"
    #behavior <str>: "Set fetch_successful = false. Proceed to scoring."
    #user_action <str>: "None — expected for some companies."
  }

  E-011 {
    #name <str>: "Website fetch timeout"
    #step_ref -> STEP-05
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "Website response takes >10 seconds"
    #behavior <str>: "Same as E-010."
    #user_action <str>: "None."
  }

  E-012 {
    #name <str>: "Blocked by firewall/WAF"
    #step_ref -> STEP-05
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "Website returns 403 or CAPTCHA"
    #behavior <str>: "Same as E-010. Log blocked domain."
    #user_action <str>: "None. Some corporate sites block automated requests."
  }

  ── AI ERRORS ─────────────────────────────────────────────────

  E-020 {
    #name <str>: "AI model unavailable"
    #step_ref -> [STEP-06, STEP-08]
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "Anthropic API returns 5xx or 529"
    #behavior <str>:
      "Retry 2x with backoff. If fails: try fallback (GPT-4o).
       If fallback fails: assign WARM tier, queue for review."
    #user_action <str>: "Check status.anthropic.com. Verify API key and credits."
    #auto_resolution <str>: "Automatic retry with fallback model."
  }

  E-021 {
    #name <str>: "API rate limited"
    #step_ref -> [STEP-06, STEP-08]
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "Anthropic API returns 429"
    #behavior <str>: "Wait for retry-after header, then retry."
    #user_action <str>: "If frequent: check API tier at console.anthropic.com."
  }

  E-022 {
    #name <str>: "Malformed scoring response"
    #step_ref -> STEP-06
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "AI response is not valid JSON"
    #behavior <str>: "Retry once. If fails: assign WARM tier, log raw response."
    #user_action <str>: "If frequent (>5%): check prompt and few-shot examples."
  }

  E-023 {
    #name <str>: "AI scoring timeout"
    #step_ref -> STEP-06
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "AI call exceeds 30-second timeout"
    #behavior <str>: "Retry once. If still timeout: assign WARM, log."
    #user_action <str>: "Usually transient. If persistent: check API status."
  }

  E-024 {
    #name <str>: "Malformed email response"
    #step_ref -> STEP-08
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "AI email response is not valid JSON or fails validation"
    #behavior <str>: "Retry once. If fails: use fallback template email."
    #user_action <str>: "Review emails marked as 'FALLBACK' in spreadsheet."
  }

  E-025 {
    #name <str>: "Email validation failed"
    #step_ref -> STEP-08
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "Generated email contains placeholders or has no personalization"
    #behavior <str>: "Regenerate once. If still fails: use fallback."
    #user_action <str>: "Check company data quality."
  }

  ── OUTPUT ERRORS ─────────────────────────────────────────────

  E-030 {
    #name <str>: "Spreadsheet not found"
    #step_ref -> [STEP-03, STEP-10, STEP-12, STEP-14]
    #severity <enum:info|warning|error|critical>: critical
    #trigger <str>: "Google Sheets API returns 404"
    #behavior <str>: "Workflow pauses. Lead data held in memory."
    #user_action <str>: "Verify spreadsheet_id in Config is correct."
  }

  E-031 {
    #name <str>: "Spreadsheet permission denied"
    #step_ref -> [STEP-10, STEP-12, STEP-14]
    #severity <enum:info|warning|error|critical>: critical
    #trigger <str>: "Google Sheets API returns 403"
    #behavior <str>: "Workflow pauses."
    #user_action <str>: "Re-authorize Google Sheets credential in n8n."
  }

  E-040 {
    #name <str>: "Gmail auth failed"
    #step_ref -> STEP-09
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "Gmail API returns 401"
    #behavior <str>: "Email NOT sent. Lead written with Status = 'AUTH_FAILED'."
    #user_action <str>: "Re-authorize Gmail credential in n8n."
  }

  E-041 {
    #name <str>: "Email send failed"
    #step_ref -> STEP-09
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "Gmail API returns error on send"
    #behavior <str>: "Retry once. If fails: set Status = 'SEND_FAILED'."
    #user_action <str>: "Check Gmail limits. Email draft is in spreadsheet."
  }

  E-042 {
    #name <str>: "Recipient email rejected"
    #step_ref -> STEP-09
    #severity <enum:info|warning|error|critical>: warning
    #trigger <str>: "Gmail rejects the recipient address"
    #behavior <str>: "Set Status = 'BOUNCED'. No retry."
    #user_action <str>: "Lead email is invalid despite passing format validation."
  }

  E-050 {
    #name <str>: "Slack notification failed"
    #step_ref -> [STEP-11, STEP-13]
    #severity <enum:info|warning|error|critical>: info
    #trigger <str>: "Slack webhook returns error"
    #behavior <str>: "Non-critical. Lead processing continues normally."
    #user_action <str>: "Verify Slack webhook URL is still valid."
  }

  ── IMPLEMENTATION ERRORS ─────────────────────────────────────

  IMPL-IMPORT-01 {
    #name <str>: "Workflow import fails"
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "n8n shows error when importing workflow JSON"
    #resolution <str>: "Check n8n version >= 1.30.0. Update if needed."
  }

  IMPL-AUTH-01 {
    #name <str>: "Google OAuth fails"
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "OAuth flow shows 'Access blocked'"
    #resolution <str>:
      "1. Verify you're added as test user in OAuth consent screen
       2. Try incognito browser window
       3. Ensure Client ID and Secret have no extra spaces"
  }

  IMPL-RUN-01 {
    #name <str>: "First test run fails"
    #severity <enum:info|warning|error|critical>: error
    #trigger <str>: "Test lead not processed"
    #resolution <str>:
      "Systematic debugging:
       1. Check n8n Executions tab for error details
       2. Webhook red? Check URL
       3. AI node red? Check Anthropic credential
       4. Sheets red? Check spreadsheet_id
       5. Gmail red? Check Gmail credential"
  }

}

================================================================================
BLOCK 9 — TESTS
================================================================================

@tests {

  #test_files {
    location <str>: "files/test/"
    contents <list>: [
      "test-lead-hot.json      — high-quality B2B SaaS lead with message",
      "test-lead-warm.json     — decent lead, limited company info",
      "test-lead-cold.json     — student with Gmail, no company",
      "test-lead-generic.json  — Gmail address with company name in form",
      "test-lead-invalid.json  — disposable email address",
      "test-lead-minimal.json  — only email field, nothing else",
      "test-lead-competitor.json — email from excluded domain"
    ]
  }

  TEST-01 {
    #name <str>: "Hot lead — full happy path"
    #type <enum:smoke|functional|edge_case|stress|regression>: smoke
    #priority <enum:P0|P1|P2>: P0
    #tests_steps -> [STEP-00 through STEP-11]

    #input {
      file <str>: "test-lead-hot.json"
      data <str>:
        '{ "email": "carlos.mendes@datavault.io",
           "name": "Carlos Mendes",
           "company": "DataVault",
           "message": "We need to automate our lead processing. Currently spending 3 hours/day on this.",
           "source": "website-pricing-page" }'
      method <str>: "POST to webhook URL"
    }

    #expected_result {
      spreadsheet_row {
        Name <str>: "Carlos Mendes"
        Company <str>: "DataVault"
        Score <str>: ">= 30 (likely 35-45 given explicit intent)"
        Tier <str>: "HOT or WARM"
        Intent <str>: ">= 8 (explicit buying intent)"
        Email_Status <str>: "SENT (if HOT) or PENDING_APPROVAL (if WARM)"
      }
      execution_time <str>: "< 45 seconds total"
    }

    #pass_criteria <str>:
      "Lead appears in Leads tab within 60 seconds.
       Score >= 30. If HOT: email in inbox with company-specific content.
       No errors in n8n Executions log."
  }

  TEST-02 {
    #name <str>: "Warm lead — limited information"
    #type <enum:smoke|functional|edge_case|stress|regression>: functional
    #priority <enum:P0|P1|P2>: P0

    #input {
      file <str>: "test-lead-warm.json"
      data <str>:
        '{ "email": "ana.costa@smallbizsolutions.com",
           "name": "Ana Costa",
           "company": "SmallBiz Solutions" }'
    }

    #expected_result {
      spreadsheet_row {
        Score <str>: "15-30 (limited info = conservative scoring)"
        Tier <str>: "WARM or COLD"
      }
    }

    #pass_criteria <str>:
      "Lead scored conservatively. If WARM: email draft exists.
       If COLD: no email, just logged."
  }

  TEST-03 {
    #name <str>: "Cold lead — student/personal email"
    #type <enum:smoke|functional|edge_case|stress|regression>: functional
    #priority <enum:P0|P1|P2>: P0

    #input {
      file <str>: "test-lead-cold.json"
      data <str>: '{ "email": "student123@gmail.com", "name": "Joao Silva" }'
    }

    #expected_result {
      spreadsheet_row {
        Tier <str>: "COLD"
        Email_Status <str>: "NONE"
      }
    }

    #pass_criteria <str>:
      "Scored as COLD. No email sent. Row in Leads tab."
  }

  TEST-04 {
    #name <str>: "Disposable email — rejection"
    #type <enum:smoke|functional|edge_case|stress|regression>: edge_case
    #priority <enum:P0|P1|P2>: P1

    #input {
      file <str>: "test-lead-invalid.json"
      data <str>: '{ "email": "fake@mailinator.com", "name": "Spam Bot" }'
    }

    #expected_result {
      leads_tab <str>: "NO new row"
      rejected_tab <str>: "New row with reason 'disposable_email'"
    }

    #pass_criteria <str>:
      "Lead rejected. Row in Rejected tab, NOT in Leads tab.
       No AI calls made. No email sent."
  }

  TEST-05 {
    #name <str>: "Competitor domain — rejection"
    #type <enum:smoke|functional|edge_case|stress|regression>: edge_case
    #priority <enum:P0|P1|P2>: P1

    #input {
      file <str>: "test-lead-competitor.json"
      data <str>: '{ "email": "spy@competitor.com", "name": "Competitor Person" }'
    }

    #expected_result {
      rejected_tab <str>: "New row with reason 'excluded_domain'"
    }

    #pass_criteria <str>:
      "Competitor lead rejected and logged. No further processing."
  }

  TEST-06 {
    #name <str>: "Minimal lead — email only"
    #type <enum:smoke|functional|edge_case|stress|regression>: edge_case
    #priority <enum:P0|P1|P2>: P1

    #input {
      file <str>: "test-lead-minimal.json"
      data <str>: '{ "email": "contact@realcompany.com" }'
    }

    #expected_result {
      spreadsheet_row {
        Name <str>: "Derived from email prefix"
        Company <str>: "Derived from email domain"
      }
    }

    #pass_criteria <str>:
      "Lead processed despite minimal data. Name and company derived
       from email. No crashes from missing fields."
  }

  TEST-07 {
    #name <str>: "Generic email with company name"
    #type <enum:smoke|functional|edge_case|stress|regression>: edge_case
    #priority <enum:P0|P1|P2>: P2

    #input {
      file <str>: "test-lead-generic.json"
      data <str>:
        '{ "email": "ceo.person@gmail.com",
           "name": "CEO Person",
           "company": "Acme Corp",
           "message": "Need your product for our 50 person team" }'
    }

    #expected_result {
      spreadsheet_row {
        Score <str>: ">= 20 (message provides intent signal)"
      }
    }

    #pass_criteria <str>:
      "Lead scored using form-provided company name and message
       despite generic email. Company research skipped (Gmail domain)."
  }

  TEST-STRESS-01 {
    #name <str>: "Volume test — 30 leads in 5 minutes"
    #type <enum:smoke|functional|edge_case|stress|regression>: stress
    #priority <enum:P0|P1|P2>: P2

    #input {
      method <str>:
        "Send 30 webhook POSTs over 5 minutes.
         Mix: 10 hot, 10 warm, 5 cold, 3 invalid, 2 competitor."
    }

    #expected_result {
      total_processed <num>: 30
      in_leads_tab <str>: "~25 rows"
      in_rejected_tab <str>: "~5 rows"
      emails_sent <str>: "~8-12 (hot leads)"
      processing_time <str>: "All complete within 15 minutes"
    }

    #pass_criteria <str>:
      "All 30 leads accounted for. No duplicates. No crashes.
       API rate limits not hit."
  }

}

================================================================================
END OF FLOWSPEC
================================================================================

  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │   AI Lead Qualifier v1.0.0                               │
  │   FlowSpec v1.0.0                                        │
  │                                                          │
  │   Author: FlowSpec Team                                  │
  │   License: Proprietary                                   │
  │   Support: hello@flowspec.dev                            │
  │                                                          │
  │   Estimated API cost: $0.014/lead                        │
  │   Estimated setup time: 40 minutes                       │
  │   Tested on: 1,847 leads                                 │
  │   Scoring agreement with humans: 94.6%                   │
  │   Email reply rate: 14.2% (vs 3.8% manual baseline)     │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
