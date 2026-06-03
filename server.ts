import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API Client safely (Lazy / Fallback-enabled)
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Mosiur AI successfully initialized with Gemini API Key.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running Mosiur AI in robust simulation mode.");
}

// Simulated CRM database state
let leads = [
  {
    id: "lead-1",
    name: "Alex Mercer",
    email: "alex.mercer@socialleads.org",
    phone: "+1 (555) 234-5678",
    status: "prospect", // prospect, hot-lead, scheduled, won, lost
    source: "Paid Facebook Ad",
    avatar: "AM",
    tags: ["src:fb-ads", "intent:cold-prospect"],
    utm: { source: "fb-ads", medium: "paid-social", campaign: "lead-magnet-q2" },
    history: [
      { date: "2026-06-03 10:00 AM", event: "Contact record created via FB Lead Form" },
      { date: "2026-06-03 10:01 AM", event: "Workflow FB-Lead-Route activated" },
      { date: "2026-06-03 10:01 AM", event: "Standard tag 'src:fb-ads' added" }
    ]
  },
  {
    id: "lead-2",
    name: "Sarah Jenkins",
    email: "sjenkins@enterpriseleads.co",
    phone: "+1 (555) 987-6543",
    status: "hot-lead",
    source: "Google Search CPC",
    avatar: "SJ",
    tags: ["src:google-paid", "intent:hot-prospect", "asset:whitepaper"],
    utm: { source: "google", medium: "cpc", campaign: "crm-software-intent" },
    history: [
      { date: "2026-06-02 02:45 PM", event: "Contact record created via Google CPC site visit" },
      { date: "2026-06-02 02:46 PM", event: "Submitted whitepaper form" },
      { date: "2026-06-02 02:48 PM", event: "Moved pipeline stage to 'Hot Lead'" }
    ]
  },
  {
    id: "lead-3",
    name: "Marcus Aurelius",
    email: "marcus.aurelius@stoicgrowth.com",
    phone: "+1 (555) 543-2109",
    status: "scheduled",
    source: "Organic Linkedin",
    avatar: "MA",
    tags: ["act:visited-pricing", "intent:high-intent"],
    utm: { source: "linkedin", medium: "organic", campaign: "stoic-growth-post" },
    history: [
      { date: "2026-06-01 09:15 AM", event: "Contact logged from LinkedIn bio redirect" },
      { date: "2026-06-01 11:30 AM", event: "Booked a GHL calendar call" },
      { date: "2026-06-01 11:30 AM", event: "Moved stage to 'Appointment Scheduled'" }
    ]
  },
  {
    id: "lead-4",
    name: "Fiona Gallagher",
    email: "fiona.g@southsideconsulting.net",
    phone: "+1 (555) 472-8833",
    status: "won",
    source: "Newsletter Lead",
    avatar: "FG",
    tags: ["status:client", "src:newsletter"],
    utm: { source: "newsletter-q1", medium: "email-broadcast", campaign: "promo-tier-3" },
    history: [
      { date: "2026-05-28 01:05 PM", event: "Imported via email broadcast list click" },
      { date: "2026-05-29 04:00 PM", event: "Won client contract signed" }
    ]
  }
];

// Customizable default Multi-Channel follow-up workflows
let workflows = [
  {
    id: "wf-1",
    name: "🔥 Facebook Multi-Channel Ultimate Follow-up",
    trigger: "Form Submitted (Origin: Facebook Lead Forms)",
    description: "Multi-channel automated engine utilizing SMS, email, and task creation to convert cold leads instantly.",
    actions: [
      { id: "act-1", type: "tag", params: { mode: "add", tag: "src:fb-ads" }, label: "Add tag: src:fb-ads" },
      { id: "act-2", type: "tag", params: { mode: "add", tag: "status:lead" }, label: "Add tag: status:lead" },
      { id: "act-3", type: "sms", params: { body: "Hey {{contact.name}}! Mosiur here from GoHighLevel Maester. Thanks for showing interest! Do you have 2 mins for a quick call?" }, label: "Send Automated SMS" },
      { id: "act-4", type: "wait", params: { duration: 15 }, label: "Wait 15 Minutes" },
      { id: "act-5", type: "email", params: { subject: "Welcome to GoHighLevel Maester", body: "Hello {{contact.name}},\n\nExcited to scale your agency operations efficiently. Let me know when you'd like to unlock your tracking mastery portal.\n\nWarmly,\nMosiur" }, label: "Send Automated Email" },
      { id: "act-6", type: "pipeline", params: { stage: "hot-lead" }, label: "Move opportunity to Hot Lead" }
    ]
  },
  {
    id: "wf-2",
    name: "⚡ Google High Intent Search Conversion Loop",
    trigger: "Google CPC Ad Click & Form Submission",
    description: "Highly focused conversions workflow leveraging instant ringless voicemail simulation and SMS nudge.",
    actions: [
      { id: "act-7", type: "tag", params: { mode: "add", tag: "src:google-paid" }, label: "Add tag: src:google-paid" },
      { id: "act-8", type: "tag", params: { mode: "add", tag: "intent:hot-prospect" }, label: "Add tag: intent:hot-prospect" },
      { id: "act-9", type: "sms", params: { body: "Hi {{contact.name}}. Saw your search for CRM solutions! I have sent our specialized PDF blueprint to your inbox. Questions?" }, label: "SMS: Resource Delivery Nudge" },
      { id: "act-10", type: "email", params: { subject: "Your requested scaling blueprint is inside", body: "Hi {{contact.name}},\n\nInside is the ultimate handbook to scaling agency operations efficiently.\n\nBest,\nMosiur.com Team" }, label: "Email Blueprint Delivery" }
    ]
  },
  {
    id: "wf-3",
    name: "📅 Calendar Booking and Confirmation Automater",
    trigger: "Calendar Appt Booked",
    description: "Fires confirmation details and tags them with proper state, avoiding duplicate reminders.",
    actions: [
      { id: "act-11", type: "tag", params: { mode: "remove", tag: "intent:cold-prospect" }, label: "Remove tag: intent:cold-prospect" },
      { id: "act-12", type: "tag", params: { mode: "add", tag: "act:booked-appointment" }, label: "Add tag: act:booked-appointment" },
      { id: "act-13", type: "pipeline", params: { stage: "scheduled" }, label: "Move opportunity to Appointment Scheduled" },
      { id: "act-14", type: "sms", params: { body: "Confirmed! Your strategy call with Mosiur is booked. Look at your email for the link!" }, label: "Confirm Booking via SMS" }
    ]
  }
];

// Helper KB for Mosiur AI when API Key is missing or fallback is required
const GHL_DOCUMENTATION_KNOWLEDGE = `
GO HIGH LEVEL (GHL) DOCUMENTATION & TAGGING MASTERY SUMMARY:
- Brand Title: GoHighLevel Maester by Mosiur.com for scaling agency operations efficiently.
- Lead Custom fields & attribution mapping: GHL maps incoming lead parameters from URL UTM strings.
- Key parameters: utm_source, utm_medium, utm_campaign, utm_content, utm_keyword, and gclid (Google Click ID) / fbclid (Facebook Click ID).
- Essential GHL global tracking pixel rule: If hosted on GHL pages (Funnels, Websites), pixel tracking of visits is automated. If hosted externally (Webflow, WordPress, Shopify, HTML), the global code script must be installed manually.
- Contact Tagging prefix systems:
  - 'src:': Tracks originating lead source channels, e.g., 'src:fb-ads', 'src:google-organic', 'src:youtube', 'src:cold-email'.
  - 'asset:': Identifies lead bait, lead magnet, or downloadable ebook, e.g., 'asset:blueprints-handbook', 'asset:free-strategy-audit'.
  - 'act:': High-impact temporary, event-driven, or engagement behavioral actions, e.g., 'act:visited-pricing', 'act:no-show-appt', 'act:sms-replied'.
  - 'status:': Long-term CRM master state or relation levels, e.g., 'status:client', 'status:lead', 'status:unsubscribed'.
- Platform Safeguards & Traps:
  - Case Sensitivity: GHL tags are completely case-sensitive. 'src:fb-ads' and 'src:FB-Ads' are treated as two distinct database records, breaking Smart Lists.
  - Infinite Loops: Adding a tag that triggers a workflow, which then adds another tag triggering the same or adjacent workflow can cause server-side infinite loops.
  - Database Bloat: Typo entry when adding generic tags like "fb lead" instead of tracking-standard tags leads to messy databases. Always enforce standardized generation.
  - Session Drift: Lead attribution parameters might fail to map if visitors are bounced across multiple redirect pages or domains prior to form submission.
- Advanced Workflows:
  - Best Practice: Remove historical temporary/intent tags once a macro state shift occurs. For instance, removing "status:prospect" when adding "status:client" using Automation Workflow.
`;

// --- API ROUTES ---

// Express CRM DB endpoints
app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.post("/api/leads", (req, res) => {
  const { name, email, phone, status, source, tags, utm } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required properties." });
  }
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    email,
    phone: phone || "+1 (555) 000-0000",
    status: status || "prospect",
    source: source || "Direct Intake",
    avatar: initials || "LD",
    tags: tags || [],
    utm: utm || { source: "direct", medium: "intake", campaign: "manual" },
    history: [
      { date: new Date().toISOString().replace("T", " ").substring(0, 19), event: "Lead manually imported into GHL Maester" }
    ]
  };
  leads.unshift(newLead);
  res.status(201).json(newLead);
});

app.put("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }
  leads[index] = { ...leads[index], ...req.body };
  res.json(leads[index]);
});

app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  leads = leads.filter((l) => l.id !== id);
  res.json({ message: "Lead soft deleted successfully." });
});

// Express Workflows endpoints
app.get("/api/workflows", (req, res) => {
  res.json(workflows);
});

app.post("/api/workflows", (req, res) => {
  const { name, trigger, description, actions } = req.body;
  if (!name || !trigger) {
    return res.status(400).json({ error: "Workflow name and entry trigger are required fields." });
  }
  const newWorkflow = {
    id: `wf-${Date.now()}`,
    name,
    trigger,
    description: description || "Custom built scaling pipeline",
    actions: actions || []
  };
  workflows.push(newWorkflow);
  res.status(201).json(newWorkflow);
});

// WORKFLOW LIVE RUNNER SIMULATION
app.post("/api/leads/:id/simulate-workflow", (req, res) => {
  const { id } = req.params;
  const { workflowId } = req.body;

  const leadIndex = leads.findIndex((l) => l.id === id);
  const workflow = workflows.find((w) => w.id === workflowId);

  if (leadIndex === -1) {
    return res.status(404).json({ error: "Simulating contact target not found." });
  }
  if (!workflow) {
    return res.status(404).json({ error: "Target workflow automation not found." });
  }

  const targetLead = leads[leadIndex];
  const logs: string[] = [];
  const timestamp = () => new Date().toISOString().replace("T", " ").substring(0, 19);

  logs.push(`[${timestamp()}] Entering workflow: "${workflow.name}"`);
  logs.push(`[${timestamp()}] Entry check: Target contact matches trigger conditions of "${workflow.trigger}"`);

  // Execute steps sequentially
  let currentTags = [...targetLead.tags];
  let currentStatus = targetLead.status;
  let historyEntries: { date: string; event: string }[] = [];

  workflow.actions.forEach((act) => {
    switch (act.type) {
      case "tag":
        const { mode, tag } = act.params;
        if (mode === "add") {
          if (!currentTags.includes(tag)) {
            currentTags.push(tag);
          }
          logs.push(`[${timestamp()}] TAG ACTION: Added contact tag: [${tag}]`);
          historyEntries.push({ date: timestamp(), event: `Workflow tag added: ${tag}` });
        } else if (mode === "remove") {
          currentTags = currentTags.filter((t) => t !== tag);
          logs.push(`[${timestamp()}] TAG ACTION: Removed contact tag: [${tag}]`);
          historyEntries.push({ date: timestamp(), event: `Workflow tag removed: ${tag}` });
        }
        break;

      case "sms":
        const smsBody = act.params.body ? act.params.body.replace("{{contact.name}}", targetLead.name) : "";
        logs.push(`[${timestamp()}] CHANNEL DISPATCH: Automated SMS sent to ${targetLead.phone || "saved phone"}: "${smsBody}"`);
        historyEntries.push({ date: timestamp(), event: `Dispatched outbound automated SMS` });
        break;

      case "email":
        const emailSubject = act.params.subject ? act.params.subject.replace("{{contact.name}}", targetLead.name) : "";
        logs.push(`[${timestamp()}] CHANNEL DISPATCH: Automated Email with subject "${emailSubject}" sent to ${targetLead.email}`);
        historyEntries.push({ date: timestamp(), event: `Dispatched automated email` });
        break;

      case "pipeline":
        currentStatus = act.params.stage;
        logs.push(`[${timestamp()}] CRM OPPORTUNITY STAGE UPDATE: State moved to '${act.params.stage}'`);
        historyEntries.push({ date: timestamp(), event: `Stage updated to: ${act.params.stage}` });
        break;

      case "wait":
        logs.push(`[${timestamp()}] DELAY RULE: Wait duration of ${act.params.duration || 5} min simulator bypass executed`);
        break;

      default:
        logs.push(`[${timestamp()}] ACTION RULE: Executed standard custom webhook command`);
    }
  });

  logs.push(`[${timestamp()}] Execution complete. persisiting contact status state in sub-account datastore.`);

  // Persist edits onto state
  leads[leadIndex].tags = currentTags;
  leads[leadIndex].status = currentStatus;
  leads[leadIndex].history = [...historyEntries, ...leads[leadIndex].history];

  res.json({
    logs,
    updatedLead: leads[leadIndex]
  });
});

// MOSIUR AI ACADEMY GROUNDED QA ENGINE
app.post("/api/academy/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question query parameter is empty." });
  }

  // If Gemini is active, run it. Otherwise, fallback beautifully.
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `User asks: ${question}`,
        config: {
          systemInstruction: `You are Mosiur AI, a world-class GoHighLevel Maester specialized in agency operations, contact tagging, workflow integrations, and attribution parameter setup.
          Provide clean, professional, friendly, and actionable insights based on the GoHighLevel Help center, official API rules, and proper CRM architecture.
          Include code snippets or clear visual instructions where appropriate. Always link strategies to "scaling agency operations efficiently" and reinforce GHL best practices.
          Keep answers compact, robust, formatted nicely with markdown. Use these structural points if relevant:
          ${GHL_DOCUMENTATION_KNOWLEDGE}`,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I was unable to formulate a response. Please refine your query.";
      return res.json({ reply, apiUsed: true });
    } catch (err: any) {
      console.error("Gemini API error during generation:", err);
      // Failover to rich fallback
    }
  }

  // Robust, extremely helpful mock-bypassed response in case Gemini is not available or key is placeholder
  const lowerQuestion = question.toLowerCase();
  let reply = "";

  if (lowerQuestion.includes("tag") || lowerQuestion.includes("prefix")) {
    reply = `### Standardizing GHL Contact Tag Naming Hierarchy (Mosiur AI Fallback)

To eliminate CRM database mess ("Tag Bloat") and scale agency operations efficiently, you should implement the **Standard Prefix-Based Tagging System**:

1. **\`src:\` Source Identifiers / Origin**
   - Tracks the actual medium or channel.
   - *Example:* \`src:fb-ads\`, \`src:google-organic\`, \`src:cold-outreach\`, \`src:partner-referral\`

2. **\`asset:\` Material Hooks**
   - Tracks the direct value offer or opt-in lead magnet.
   - *Example:* \`asset:scaling-blueprint-pdf\`, \`asset:free-setup-blueprint\`, \`asset:audit-consultation\`

3. **\`act:\` Action & Behavior Identifiers**
   - Tracks behavioral logs captured by links, tracking pixel, or automation events.
   - *Example:* \`act:visited-pricing-tab\`, \`act:clicked-webinar-replay\`, \`act:sms-unsubscribed\`

4. **\`status:\` Funnel Master State**
   - Represents the macro billing, sales or interaction cycle.
   - *Example:* \`status:lead\`, \`status:mql\`, \`status:booked-appt\`, \`status:paying-client\`, \`status:lost\`

**🚨 Critical Safeguard Trap:**
GoHighLevel tags are **case-sensitive**. A lead marked \`src:fb-ads\` and another marked \`src:FB-Ads\` will live in completely different filter groups, fracturing your client reporting segments! Ensure you clean strings using lowercase filters before setting up automation logic.`;
  } else if (lowerQuestion.includes("pixel") || lowerQuestion.includes("utm") || lowerQuestion.includes("attribution")) {
    reply = `### How GoHighLevel Tracks UTM & Attribution Vectors (Mosiur AI Fallback)

Great question! Capturing multi-touch and double-attribution parameters ensures you can trace agency lead value efficiently back to raw spending.

#### 🎯 Native Funnels & Landing Pages
If you build landers natively in **GHL Funnels** or **GHL Websites**, GHL automatically maps active URL parameters into native contact properties if a contact registers a Form, Survey, or Calendar submit in the same session:
- \`utm_source\`
- \`utm_medium\`
- \`utm_campaign\`
- \`utm_content\`
- \`utm_term\`

#### 🌐 External Platforms (WordPress, Custom React, Webflow)
For external landers, you **must manual inject** the sub-account global tracking pixel. You fetch this from **Sub-account Settings > Business Profile > Web Pixel** or Funnel Settings:
\`\`\`html
<!-- Paste inside <head> on Webflow / custom site of choice -->
<script src="https://services.leadconnectorhq.com/app/js/pixel.js" data-id="your-unique-subaccount-id"></script>
\`\`\`

#### ⚠️ Beware of "Session Drift"
If you redirect a client through multiple non-pixel-tracked intermediate steps (like a payment portal or questionnaire redirect) before they write their details on a GHL checkout page, the browser session cookie splits. Keep opt-ins compact and direct on targeted tracking landers to ensure accurate attribution.`;
  } else if (lowerQuestion.includes("workflow") || lowerQuestion.includes("loop") || lowerQuestion.includes("cycle")) {
    reply = `### Scaling Workflow Safety & Preventing Infinite Loops

Workflows inside HighLevel are extremely robust, but if built without proper safety rails, they can crash sub-account performance or send repetitive client messaging:

1. **The 'Contact Tag Added' Infinite Loop Loop:**
   - *The Trap:* Workflow A triggers when tag \`status:customer\` is added, and ends by invoking a custom webhook or CRM edit. This secondary update re-triggers external APIs that add \`status:customer\` back again.
   - *The Solution:* Turn on **'Allow Re-entry'** toggles **ONLY** if the lead has distinct trigger-exit criteria. Guard exits natively.

2. **Sequential Status Swapping:**
   - Instead of piling on tags endlessly, use automatic cleanup:
     - ACTION 1: **Add Contact Tag** (\`status:paying-client\`)
     - ACTION 2: **Remove Contact Tag** (\`status:lead\`)
     - ACTION 3: **Remove Contact Tag** (\`status:onbooking-nudge\`)

This guarantees smart lists load extremely fast and agency operations scale with maximum performance! Let me know if you need help designing a custom multi-channel workflow!`;
  } else {
    reply = `### GoHighLevel Maester Academy Insights (Mosiur AI Fallback)

Thanks for submitting your question to our GoHighLevel Help Core by Mosiur.com.

#### 💡 Let's talk about building elite agency operations:
- **Lead Intake Automations:** Connect Form fields natively to GHL triggers to kick off automated workflows.
- **Unified Communication Pipelines:** GoHighLevel pipelines sync SMS, real-time emails, Facebook messenger threads, and dialer calls into a single, high-contrast tab interface.
- **Prefix Standard:** Enforce strict lowercase tagging categories: \`src:\`, \`asset:\`, \`act:\`, and \`status:\`.

*Prompt suggestion:* Learn more about:
1. **"Standardizing tag categories for Facebook lead ads"**
2. **"How to set up external GHL Pixel Tracking"**
3. **"Preventing double automation loops in multi-channel sequences"**`;
  }

  res.json({ reply, apiUsed: false });
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GoHighLevel Maester server running on http://localhost:${PORT}`);
  });
}

startServer();
