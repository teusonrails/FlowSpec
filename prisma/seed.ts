import { PrismaClient, UserRole, AutomationStatus, AutomationTier, Domain, Complexity, PurchaseTier, PurchaseStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

// ──────────────────────────────────────────────
// PLATFORMS
// ──────────────────────────────────────────────

const platforms = [
  { name: "Make.com", slug: "make" },
  { name: "Zapier", slug: "zapier" },
  { name: "n8n", slug: "n8n" },
  { name: "Power Automate", slug: "power-automate" },
  { name: "Pipedream", slug: "pipedream" },
  { name: "Activepieces", slug: "activepieces" },
  { name: "Windmill", slug: "windmill" },
];

// ──────────────────────────────────────────────
// TOOLS
// ──────────────────────────────────────────────

const tools = [
  { name: "Slack", slug: "slack", category: "Communication" },
  { name: "Gmail", slug: "gmail", category: "Email" },
  { name: "Google Sheets", slug: "google-sheets", category: "Spreadsheet" },
  { name: "Notion", slug: "notion", category: "Productivity" },
  { name: "Airtable", slug: "airtable", category: "Database" },
  { name: "HubSpot", slug: "hubspot", category: "CRM" },
  { name: "Salesforce", slug: "salesforce", category: "CRM" },
  { name: "Jira", slug: "jira", category: "Project Management" },
  { name: "GitHub", slug: "github", category: "Development" },
  { name: "Trello", slug: "trello", category: "Project Management" },
  { name: "Discord", slug: "discord", category: "Communication" },
  { name: "Stripe", slug: "stripe", category: "Payment" },
  { name: "Shopify", slug: "shopify", category: "E-Commerce" },
  { name: "WordPress", slug: "wordpress", category: "CMS" },
  { name: "Linear", slug: "linear", category: "Project Management" },
  { name: "Intercom", slug: "intercom", category: "Support" },
  { name: "Zendesk", slug: "zendesk", category: "Support" },
  { name: "Mailchimp", slug: "mailchimp", category: "Marketing" },
  { name: "Twilio", slug: "twilio", category: "Communication" },
  { name: "SendGrid", slug: "sendgrid", category: "Email" },
];

// ──────────────────────────────────────────────
// AI MODELS
// ──────────────────────────────────────────────

const aiModels = [
  { name: "GPT-4o", provider: "OpenAI" },
  { name: "GPT-4o Mini", provider: "OpenAI" },
  { name: "Claude 4 Sonnet", provider: "Anthropic" },
  { name: "Claude 4 Opus", provider: "Anthropic" },
  { name: "Gemini 2.0 Pro", provider: "Google" },
  { name: "Llama 3.3", provider: "Meta" },
  { name: "Mistral Large", provider: "Mistral" },
  { name: "DALL-E 3", provider: "OpenAI" },
];

// ──────────────────────────────────────────────
// TAGS
// ──────────────────────────────────────────────

const tags = [
  "email-automation", "crm", "social-media", "data-sync", "lead-generation",
  "customer-support", "e-commerce", "content-creation", "reporting", "workflow",
  "ai-assistant", "document-processing", "notification", "scheduling",
  "data-enrichment", "invoicing", "onboarding", "analytics", "chatbot",
  "inventory", "recruitment", "compliance", "marketing-automation",
  "project-management", "file-management", "api-integration", "monitoring",
  "backup", "translation", "image-generation",
];

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────

const users = [
  { name: "Alex Rivera", email: "alex@example.com", role: UserRole.CREATOR },
  { name: "Sarah Chen", email: "sarah@example.com", role: UserRole.CREATOR },
  { name: "Marcus Johnson", email: "marcus@example.com", role: UserRole.CREATOR },
  { name: "Emily Watson", email: "emily@example.com", role: UserRole.CREATOR },
  { name: "David Kim", email: "david@example.com", role: UserRole.CREATOR },
  { name: "Lisa Park", email: "lisa@example.com", role: UserRole.BUYER },
  { name: "Tom Harris", email: "tom@example.com", role: UserRole.BUYER },
  { name: "Nina Patel", email: "nina@example.com", role: UserRole.BUYER },
  { name: "James Wilson", email: "james@example.com", role: UserRole.BUYER },
  { name: "Maria Garcia", email: "maria@example.com", role: UserRole.BUYER },
];

const creatorProfiles = [
  { displayName: "Alex Rivera", bio: "Automation expert specializing in sales and CRM workflows." },
  { displayName: "Sarah Chen", bio: "Full-stack developer building AI-powered business automations." },
  { displayName: "Marcus Johnson", bio: "DevOps engineer creating infrastructure and monitoring flows." },
  { displayName: "Emily Watson", bio: "Marketing automation specialist with 10+ years experience." },
  { displayName: "David Kim", bio: "E-commerce consultant automating Shopify and inventory workflows." },
];

// ──────────────────────────────────────────────
// AUTOMATIONS
// ──────────────────────────────────────────────

const automations = [
  {
    name: "AI-Powered Email Triage",
    slug: "ai-email-triage",
    description: "Automatically classify, prioritize, and route incoming emails using GPT-4o.",
    domain: Domain.SUPPORT,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.CURATED,
    priceStarter: 1999,
    pricePro: 3999,
    priceAgency: 7999,
    platforms: ["make"],
    tools: ["gmail", "slack", "notion"],
    aiModels: ["GPT-4o"],
    tags: ["email-automation", "ai-assistant", "customer-support"],
  },
  {
    name: "Smart CRM Data Enrichment",
    slug: "smart-crm-enrichment",
    description: "Enrich CRM leads with company data, social profiles, and AI-generated insights.",
    domain: Domain.SALES,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 2999,
    pricePro: 5999,
    priceAgency: 9999,
    platforms: ["zapier"],
    tools: ["hubspot", "salesforce"],
    aiModels: ["GPT-4o", "Claude 4 Sonnet"],
    tags: ["crm", "data-enrichment", "lead-generation"],
  },
  {
    name: "Social Media Content Pipeline",
    slug: "social-media-pipeline",
    description: "Generate, schedule, and publish social media content across multiple platforms.",
    domain: Domain.MARKETING,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 999,
    pricePro: 2499,
    platforms: ["make", "n8n"],
    tools: ["notion", "airtable"],
    aiModels: ["GPT-4o", "DALL-E 3"],
    tags: ["social-media", "content-creation", "marketing-automation"],
  },
  {
    name: "Invoice Processing Automation",
    slug: "invoice-processing",
    description: "Extract data from invoices using AI and sync to your accounting system.",
    domain: Domain.FINANCE,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.CURATED,
    priceStarter: 1499,
    pricePro: 2999,
    priceAgency: 5999,
    platforms: ["make"],
    tools: ["google-sheets", "gmail"],
    aiModels: ["Claude 4 Sonnet"],
    tags: ["invoicing", "document-processing", "finance"],
  },
  {
    name: "Customer Onboarding Flow",
    slug: "customer-onboarding",
    description: "Automated welcome sequence with personalized emails and task creation.",
    domain: Domain.SUPPORT,
    complexity: Complexity.BASIC,
    tier: AutomationTier.OPEN,
    priceStarter: 799,
    platforms: ["zapier"],
    tools: ["gmail", "slack", "trello"],
    aiModels: ["GPT-4o Mini"],
    tags: ["onboarding", "email-automation", "workflow"],
  },
  {
    name: "GitHub PR Review Assistant",
    slug: "github-pr-review",
    description: "AI-powered code review that comments on PRs with suggestions and security checks.",
    domain: Domain.DEVOPS,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 2499,
    pricePro: 4999,
    platforms: ["n8n"],
    tools: ["github", "slack", "linear"],
    aiModels: ["Claude 4 Opus"],
    tags: ["api-integration", "monitoring", "project-management"],
  },
  {
    name: "E-Commerce Order Sync",
    slug: "ecommerce-order-sync",
    description: "Sync orders between Shopify, inventory systems, and shipping providers.",
    domain: Domain.ECOMMERCE,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 1299,
    pricePro: 2999,
    platforms: ["make", "zapier"],
    tools: ["shopify", "google-sheets", "stripe"],
    aiModels: [],
    tags: ["e-commerce", "data-sync", "inventory"],
  },
  {
    name: "Meeting Notes Summarizer",
    slug: "meeting-notes-summarizer",
    description: "Transcribe meetings and generate structured summaries with action items.",
    domain: Domain.OPERATIONS,
    complexity: Complexity.BASIC,
    tier: AutomationTier.FREE,
    platforms: ["zapier"],
    tools: ["notion", "slack"],
    aiModels: ["GPT-4o"],
    tags: ["ai-assistant", "content-creation", "workflow"],
  },
  {
    name: "Lead Scoring Pipeline",
    slug: "lead-scoring-pipeline",
    description: "Score and rank leads using AI analysis of engagement data and firmographics.",
    domain: Domain.SALES,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 3499,
    pricePro: 6999,
    priceAgency: 12999,
    platforms: ["n8n"],
    tools: ["hubspot", "salesforce", "airtable"],
    aiModels: ["GPT-4o", "Claude 4 Sonnet"],
    tags: ["lead-generation", "crm", "analytics"],
  },
  {
    name: "Helpdesk Ticket Router",
    slug: "helpdesk-ticket-router",
    description: "Automatically categorize and route support tickets to the right team.",
    domain: Domain.SUPPORT,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 1499,
    pricePro: 2999,
    platforms: ["make"],
    tools: ["zendesk", "intercom", "slack"],
    aiModels: ["GPT-4o Mini"],
    tags: ["customer-support", "ai-assistant", "notification"],
  },
  {
    name: "Blog Post Generator",
    slug: "blog-post-generator",
    description: "Generate SEO-optimized blog posts from topic outlines using AI.",
    domain: Domain.MARKETING,
    complexity: Complexity.BASIC,
    tier: AutomationTier.OPEN,
    priceStarter: 599,
    pricePro: 1499,
    platforms: ["make"],
    tools: ["wordpress", "notion"],
    aiModels: ["GPT-4o", "Claude 4 Sonnet"],
    tags: ["content-creation", "marketing-automation", "ai-assistant"],
  },
  {
    name: "Recruitment Pipeline Automator",
    slug: "recruitment-pipeline",
    description: "Automate candidate screening, scheduling, and communication workflows.",
    domain: Domain.HR,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 2999,
    pricePro: 5999,
    platforms: ["zapier", "make"],
    tools: ["gmail", "google-sheets", "slack"],
    aiModels: ["Claude 4 Sonnet"],
    tags: ["recruitment", "email-automation", "scheduling"],
  },
  {
    name: "Data Backup Orchestrator",
    slug: "data-backup-orchestrator",
    description: "Automated backup workflows for databases, files, and SaaS data.",
    domain: Domain.DEVOPS,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 999,
    platforms: ["n8n", "windmill"],
    tools: ["github"],
    aiModels: [],
    tags: ["backup", "monitoring", "file-management"],
  },
  {
    name: "Multi-Language Chatbot",
    slug: "multi-language-chatbot",
    description: "AI chatbot with real-time translation supporting 20+ languages.",
    domain: Domain.SUPPORT,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 3999,
    pricePro: 7999,
    platforms: ["make"],
    tools: ["intercom", "twilio", "slack"],
    aiModels: ["GPT-4o", "Claude 4 Sonnet"],
    tags: ["chatbot", "translation", "customer-support"],
  },
  {
    name: "Weekly Analytics Report",
    slug: "weekly-analytics-report",
    description: "Compile data from multiple sources into a beautiful weekly report.",
    domain: Domain.DATA,
    complexity: Complexity.BASIC,
    tier: AutomationTier.FREE,
    platforms: ["zapier"],
    tools: ["google-sheets", "slack", "notion"],
    aiModels: ["GPT-4o Mini"],
    tags: ["reporting", "analytics", "data-sync"],
  },
  {
    name: "Contract Review Assistant",
    slug: "contract-review-assistant",
    description: "AI-powered contract analysis that flags risks and extracts key terms.",
    domain: Domain.LEGAL,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 4999,
    pricePro: 9999,
    platforms: ["n8n"],
    tools: ["google-sheets", "gmail", "notion"],
    aiModels: ["Claude 4 Opus"],
    tags: ["document-processing", "compliance", "ai-assistant"],
  },
  {
    name: "Inventory Alert System",
    slug: "inventory-alert-system",
    description: "Monitor inventory levels and send alerts when stock runs low.",
    domain: Domain.ECOMMERCE,
    complexity: Complexity.BASIC,
    tier: AutomationTier.OPEN,
    priceStarter: 499,
    platforms: ["zapier"],
    tools: ["shopify", "slack", "sendgrid"],
    aiModels: [],
    tags: ["inventory", "notification", "e-commerce"],
  },
  {
    name: "Compliance Monitoring Bot",
    slug: "compliance-monitoring",
    description: "Continuously monitor regulatory changes and alert your compliance team.",
    domain: Domain.LEGAL,
    complexity: Complexity.ADVANCED,
    tier: AutomationTier.CURATED,
    priceStarter: 3999,
    pricePro: 7999,
    platforms: ["n8n", "windmill"],
    tools: ["slack", "notion", "gmail"],
    aiModels: ["Claude 4 Opus"],
    tags: ["compliance", "monitoring", "notification"],
  },
  {
    name: "Real Estate Lead Nurture",
    slug: "real-estate-lead-nurture",
    description: "Automated follow-up sequences for real estate leads with personalized messaging.",
    domain: Domain.REAL_ESTATE,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 1999,
    pricePro: 3999,
    platforms: ["zapier"],
    tools: ["hubspot", "gmail", "twilio"],
    aiModels: ["GPT-4o"],
    tags: ["lead-generation", "email-automation", "crm"],
  },
  {
    name: "Student Progress Tracker",
    slug: "student-progress-tracker",
    description: "Track student performance across courses and generate personalized feedback.",
    domain: Domain.EDUCATION,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 999,
    pricePro: 1999,
    platforms: ["make"],
    tools: ["google-sheets", "notion", "gmail"],
    aiModels: ["GPT-4o Mini"],
    tags: ["reporting", "analytics", "email-automation"],
  },
  {
    name: "Shipping Tracker & Notifier",
    slug: "shipping-tracker-notifier",
    description: "Track shipments across carriers and send proactive status updates.",
    domain: Domain.LOGISTICS,
    complexity: Complexity.BASIC,
    tier: AutomationTier.OPEN,
    priceStarter: 699,
    platforms: ["zapier"],
    tools: ["shopify", "sendgrid", "slack"],
    aiModels: [],
    tags: ["notification", "e-commerce", "data-sync"],
  },
  {
    name: "Patient Appointment Scheduler",
    slug: "patient-appointment-scheduler",
    description: "Automated appointment booking, reminders, and follow-ups for healthcare.",
    domain: Domain.HEALTHCARE,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.CURATED,
    priceStarter: 2499,
    pricePro: 4999,
    platforms: ["make"],
    tools: ["gmail", "google-sheets", "twilio"],
    aiModels: ["GPT-4o Mini"],
    tags: ["scheduling", "notification", "email-automation"],
  },
  {
    name: "Project Status Aggregator",
    slug: "project-status-aggregator",
    description: "Pull status updates from Jira, Linear, and GitHub into a unified dashboard.",
    domain: Domain.OPERATIONS,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 1299,
    pricePro: 2499,
    platforms: ["n8n", "pipedream"],
    tools: ["jira", "linear", "github", "slack"],
    aiModels: [],
    tags: ["project-management", "data-sync", "reporting"],
  },
  {
    name: "AI Image Generation Pipeline",
    slug: "ai-image-pipeline",
    description: "Generate, resize, and publish AI images for marketing campaigns.",
    domain: Domain.MARKETING,
    complexity: Complexity.INTERMEDIATE,
    tier: AutomationTier.OPEN,
    priceStarter: 1499,
    pricePro: 2999,
    platforms: ["make"],
    tools: ["airtable", "wordpress"],
    aiModels: ["DALL-E 3", "GPT-4o"],
    tags: ["image-generation", "content-creation", "marketing-automation"],
  },
  {
    name: "Multi-Channel Notification Hub",
    slug: "multi-channel-notification",
    description: "Route alerts to Slack, email, SMS, or Discord based on priority and type.",
    domain: Domain.GENERAL,
    complexity: Complexity.BASIC,
    tier: AutomationTier.FREE,
    platforms: ["zapier", "make"],
    tools: ["slack", "discord", "gmail", "twilio", "sendgrid"],
    aiModels: [],
    tags: ["notification", "workflow", "api-integration"],
  },
];

// ──────────────────────────────────────────────
// REVIEWS
// ──────────────────────────────────────────────

const reviewComments = [
  { rating: 5, title: "Excellent automation!", body: "Saved me hours of manual work every week. Setup was straightforward." },
  { rating: 5, title: "Worth every penny", body: "The documentation is clear and the flow handles edge cases well." },
  { rating: 4, title: "Great but could improve", body: "Works well for most cases. Would love to see more customization options." },
  { rating: 4, title: "Solid workflow", body: "Does exactly what it promises. Good value for the price." },
  { rating: 5, title: "Game changer", body: "This automation completely transformed our team's productivity." },
  { rating: 3, title: "Decent start", body: "Works but needed some tweaking to fit our specific use case." },
  { rating: 5, title: "Incredible quality", body: "One of the best automations I've purchased. Highly recommended." },
  { rating: 4, title: "Very useful", body: "Good automation with clear setup instructions. Minor issues with error handling." },
  { rating: 5, title: "Must-have", body: "If you're not using this, you're leaving money on the table." },
  { rating: 4, title: "Reliable and clean", body: "Clean implementation. Has been running without issues for weeks." },
];

// ──────────────────────────────────────────────
// MAIN SEED
// ──────────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // Platforms
  const createdPlatforms = await Promise.all(
    platforms.map((p) =>
      prisma.platform.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
      })
    )
  );
  console.log(`Seeded ${createdPlatforms.length} platforms`);

  // Tools
  const createdTools = await Promise.all(
    tools.map((t) =>
      prisma.tool.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      })
    )
  );
  console.log(`Seeded ${createdTools.length} tools`);

  // AI Models
  const createdModels = await Promise.all(
    aiModels.map((m) =>
      prisma.aiModel.upsert({
        where: { name: m.name },
        update: {},
        create: m,
      })
    )
  );
  console.log(`Seeded ${createdModels.length} AI models`);

  // Tags
  const createdTags = await Promise.all(
    tags.map((name) =>
      prisma.tag.upsert({
        where: { slug: name },
        update: {},
        create: { name: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), slug: name },
      })
    )
  );
  console.log(`Seeded ${createdTags.length} tags`);

  // Users
  const createdUsers = await Promise.all(
    users.map((u, i) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          supabaseAuthId: `seed-auth-${i}`,
        },
      })
    )
  );
  console.log(`Seeded ${createdUsers.length} users`);

  // Creator profiles (first 5 users)
  const createdCreators = await Promise.all(
    creatorProfiles.map((cp, i) =>
      prisma.creatorProfile.upsert({
        where: { userId: createdUsers[i].id },
        update: {},
        create: {
          ...cp,
          userId: createdUsers[i].id,
        },
      })
    )
  );
  console.log(`Seeded ${createdCreators.length} creator profiles`);

  // Helper maps
  const platformMap = new Map(createdPlatforms.map((p) => [p.slug, p.id]));
  const toolMap = new Map(createdTools.map((t) => [t.slug, t.id]));
  const modelMap = new Map(createdModels.map((m) => [m.name, m.id]));
  const tagMap = new Map(createdTags.map((t) => [t.slug, t.id]));

  // Automations
  const createdAutomations = [];
  for (let i = 0; i < automations.length; i++) {
    const a = automations[i];
    const creator = createdCreators[i % createdCreators.length];

    const automation = await prisma.automation.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        name: a.name,
        slug: a.slug,
        description: a.description,
        longDescription: `${a.description}\n\nThis automation provides a complete end-to-end workflow that integrates seamlessly with your existing tools. Built with best practices and thoroughly tested for production use.`,
        domain: a.domain,
        complexity: a.complexity,
        tier: a.tier,
        priceStarter: a.priceStarter ?? null,
        pricePro: a.pricePro ?? null,
        priceAgency: a.priceAgency ?? null,
        status: AutomationStatus.PUBLISHED,
        version: "1.0.0",
        creatorId: creator.id,
        publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        totalSales: Math.floor(Math.random() * 200),
        totalRevenue: 0,
        viewCount: Math.floor(Math.random() * 2000 + 100),
        downloadCount: Math.floor(Math.random() * 300),
        platforms: {
          create: a.platforms
            .map((slug) => platformMap.get(slug))
            .filter((id): id is string => !!id)
            .map((platformId) => ({ platformId })),
        },
        tools: {
          create: a.tools
            .map((slug) => toolMap.get(slug))
            .filter((id): id is string => !!id)
            .map((toolId) => ({ toolId })),
        },
        aiModels: {
          create: a.aiModels
            .map((name) => modelMap.get(name))
            .filter((id): id is string => !!id)
            .map((aiModelId) => ({ aiModelId })),
        },
        tags: {
          create: a.tags
            .map((slug) => tagMap.get(slug))
            .filter((id): id is string => !!id)
            .map((tagId) => ({ tagId })),
        },
      },
    });
    createdAutomations.push(automation);
  }
  console.log(`Seeded ${createdAutomations.length} automations`);

  // Reviews (buyers review automations)
  const buyerUsers = createdUsers.filter((u) => u.role === UserRole.BUYER);
  const paidAutomations = createdAutomations.filter(
    (a) => a.tier !== AutomationTier.FREE
  );
  let reviewCount = 0;

  for (const buyer of buyerUsers) {
    // Each buyer reviews 4-8 random automations
    const numReviews = Math.floor(Math.random() * 5) + 4;
    const shuffled = [...paidAutomations].sort(() => Math.random() - 0.5);
    const toReview = shuffled.slice(0, numReviews);

    for (const automation of toReview) {
      const comment = reviewComments[reviewCount % reviewComments.length];
      try {
        await prisma.review.create({
          data: {
            userId: buyer.id,
            automationId: automation.id,
            rating: comment.rating,
            title: comment.title,
            body: comment.body,
          },
        });
        reviewCount++;
      } catch {
        // Skip duplicate reviews
      }
    }
  }
  console.log(`Seeded ${reviewCount} reviews`);

  // Update automation stats
  for (const automation of createdAutomations) {
    const reviews = await prisma.review.findMany({
      where: { automationId: automation.id },
    });
    if (reviews.length > 0) {
      const avg =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          avgRating: Math.round(avg * 10) / 10,
          reviewCount: reviews.length,
          totalRevenue: automation.totalSales * (automation.priceStarter ?? 0),
        },
      });
    }
  }
  console.log("Updated automation stats");

  // Purchases
  let purchaseCount = 0;
  for (const buyer of buyerUsers) {
    const numPurchases = Math.floor(Math.random() * 5) + 3;
    const shuffled = [...paidAutomations].sort(() => Math.random() - 0.5);
    const toBuy = shuffled.slice(0, numPurchases);

    for (const automation of toBuy) {
      const price = automation.priceStarter ?? 0;
      const fee = Math.round(price * 0.25);
      try {
        await prisma.purchase.create({
          data: {
            buyerId: buyer.id,
            automationId: automation.id,
            tier: PurchaseTier.STARTER,
            amountPaid: price,
            platformFee: fee,
            creatorEarnings: price - fee,
            status: PurchaseStatus.COMPLETED,
          },
        });
        purchaseCount++;
      } catch {
        // Skip duplicate purchases
      }
    }
  }
  console.log(`Seeded ${purchaseCount} purchases`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
