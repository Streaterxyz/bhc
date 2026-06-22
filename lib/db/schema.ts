/**
 * Drizzle schema for the BHC funnel database (Neon Postgres).
 *
 * Tables are intentionally created up front for the full Phase 2 lifecycle
 * even though Phase 2A only writes to `leads` + `videoEvents`. Materialising
 * everything now means we only run one production migration and never have
 * to worry about the schema diverging between environments.
 *
 * Naming convention: snake_case in the database, camelCase in TypeScript.
 * Drizzle handles the mapping via the second arg to each column.
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
  uuid,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── leads ──────────────────────────────────────────────────────────
// Anyone who hits POST /api/leads — typically by submitting the email
// capture form on /training. Becomes the canonical identity of every
// user through the rest of the funnel.
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Acquisition attribution — pulled from URL params + referer header
    // at signup time. Lets us answer "where did paying customers come from?"
    source: text("source"), // "training" | "home_cta" | "footer" | ...
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    referrer: text("referrer"),
    landingPage: text("landing_page"),

    // Geo — derived from IP at signup (Vercel header). Two-letter ISO.
    ipCountry: varchar("ip_country", { length: 2 }),

    // Lifecycle status. Refunds + bounces flip these.
    status: text("status").notNull().default("active"), // active | unsubscribed | bounced

    // Admin manual "needs attention" flag (Phase 4) — admin annotation, not
    // customer-owned data. flaggedBy/flaggedAt give a light audit trail.
    needsAttention: boolean("needs_attention").notNull().default(false),
    flaggedBy: text("flagged_by"),
    flaggedAt: timestamp("flagged_at", { withTimezone: true }),

    // Free-form integrations payload (e.g. Loops contact ID after sync).
    meta: jsonb("meta"),
  },
  (t) => [
    // Uniqueness on lowercase email — explicit so we can do upserts cleanly
    // even if the user retypes with different case.
    uniqueIndex("leads_email_lower_uniq").on(t.email),
    index("leads_created_at_idx").on(t.createdAt),
    index("leads_utm_source_idx").on(t.utmSource),
  ],
);

// ─── video_events ───────────────────────────────────────────────────
// Player progress events from Cloudflare Stream. Throttled to ~1 every
// 10 seconds on the client. Powers the drop-off curve in the admin
// dashboard ("where does the training lose people?").
export const videoEvents = pgTable(
  "video_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),

    // Discrete: play | pause | progress_25 | progress_50 | progress_75 | complete
    // Continuous progress samples write event_type = "progress" + watched_seconds.
    eventType: text("event_type").notNull(),
    watchedSeconds: integer("watched_seconds"),
    durationSeconds: integer("duration_seconds"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("video_events_lead_idx").on(t.leadId),
    index("video_events_type_idx").on(t.eventType),
    index("video_events_created_at_idx").on(t.createdAt),
  ],
);

// ─── purchases (Phase 2B) ───────────────────────────────────────────
// One row per Stripe checkout session. Created in `pending` when the
// session is started, flipped to `paid` by the checkout.session.completed
// webhook, flipped to `refunded` by the charge.refunded webhook.
export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),

    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),

    productId: text("product_id").notNull(), // "templates-zip-89aud" for now
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("AUD"),

    // pending → paid → refunded (or failed)
    status: text("status").notNull().default("pending"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("purchases_stripe_session_uniq").on(t.stripeCheckoutSessionId),
    index("purchases_lead_idx").on(t.leadId),
    index("purchases_status_idx").on(t.status),
  ],
);

// ─── downloads (Phase 2B) ───────────────────────────────────────────
// Audit log of every signed-URL download issued from /downloads.
// One row per download click (not per purchase) — used both for
// analytics and to detect abuse.
export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id, { onDelete: "cascade" }),

    fileKey: text("file_key").notNull(), // R2 object key, e.g. "templates/v1.zip"
    downloadedAt: timestamp("downloaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    ipAddress: varchar("ip_address", { length: 45 }), // ipv6 max
    userAgent: text("user_agent"),
  },
  (t) => [
    index("downloads_purchase_idx").on(t.purchaseId),
    index("downloads_downloaded_at_idx").on(t.downloadedAt),
  ],
);

// ─── venue_profiles (Tools — Phase 1) ───────────────────────────────
// One venue per customer (single-venue v1). Captured once at onboarding,
// then used to pre-fill + personalise every tool. Keyed to the lead (the
// customer IS the account).
export const venueProfiles = pgTable(
  "venue_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    // restaurant | bar | cafe | pub | hotel
    type: text("type").notNull(),
    seatsCapacity: integer("seats_capacity"),
    avgSpendPerHead: integer("avg_spend_per_head"), // whole dollars
    targetLabourPct: integer("target_labour_pct").notNull().default(28),
    tradingDays: integer("trading_days").notNull().default(7),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("venue_profiles_lead_uniq").on(t.leadId)],
);

// ─── tool_snapshots (Tools — Phase 1) ───────────────────────────────
// One generic, extensible table for every tool's versioned monthly run.
// `payload` holds tool-specific inputs + computed results; `dollarsIdentified`
// and `healthScore` are denormalised for fast dashboard aggregation.
// `lockedAt` null = the editable current-month draft.
export const toolSnapshots = pgTable(
  "tool_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),

    // diagnostic | roster | menu | supplier
    tool: text("tool").notNull(),
    periodMonth: varchar("period_month", { length: 7 }).notNull(), // YYYY-MM

    payload: jsonb("payload").notNull().default({}),
    dollarsIdentified: integer("dollars_identified"), // annualised $; null = health-only
    healthScore: integer("health_score"), // /100; diagnostic only

    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("tool_snapshots_lead_tool_period_uniq").on(
      t.leadId,
      t.tool,
      t.periodMonth,
    ),
    index("tool_snapshots_lead_tool_idx").on(t.leadId, t.tool),
  ],
);

// ─── ai_usage (AI menu import — daily cap) ──────────────────────────
// One row per AI call (e.g. a menu scan). Counted per lead per day to
// enforce a soft cap that protects against runaway Anthropic API cost.
// Also doubles as a usage/cost audit log.
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(), // "menu_import"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_usage_lead_feature_created_idx").on(t.leadId, t.feature, t.createdAt)],
);

// ─── admin_notes (Admin portal — Phase 4) ───────────────────────────
// Support notes an admin writes against a customer. Admin-owned metadata
// layered on top of the read-only customer data. One stream per lead,
// rendered newest-first on the customer detail page.
export const adminNotes = pgTable(
  "admin_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    authorEmail: text("author_email").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("admin_notes_lead_idx").on(t.leadId),
    index("admin_notes_created_idx").on(t.createdAt),
  ],
);

// ─── Type exports ───────────────────────────────────────────────────
// Inferred row + insert types — saves manual TypeScript everywhere.
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type VideoEvent = typeof videoEvents.$inferSelect;
export type NewVideoEvent = typeof videoEvents.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
export type VenueProfile = typeof venueProfiles.$inferSelect;
export type NewVenueProfile = typeof venueProfiles.$inferInsert;
export type ToolSnapshot = typeof toolSnapshots.$inferSelect;
export type NewToolSnapshot = typeof toolSnapshots.$inferInsert;
export type AdminNote = typeof adminNotes.$inferSelect;
export type NewAdminNote = typeof adminNotes.$inferInsert;
