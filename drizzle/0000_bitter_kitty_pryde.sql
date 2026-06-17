CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"file_key" text NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"referrer" text,
	"landing_page" text,
	"ip_country" varchar(2),
	"status" text DEFAULT 'active' NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"product_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'AUD' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tool_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"tool" text NOT NULL,
	"period_month" varchar(7) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dollars_identified" integer,
	"health_score" integer,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venue_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"seats_capacity" integer,
	"avg_spend_per_head" integer,
	"target_labour_pct" integer DEFAULT 28 NOT NULL,
	"trading_days" integer DEFAULT 7 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"watched_seconds" integer,
	"duration_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_snapshots" ADD CONSTRAINT "tool_snapshots_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_profiles" ADD CONSTRAINT "venue_profiles_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_events" ADD CONSTRAINT "video_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "downloads_purchase_idx" ON "downloads" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "downloads_downloaded_at_idx" ON "downloads" USING btree ("downloaded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_email_lower_uniq" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_utm_source_idx" ON "leads" USING btree ("utm_source");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_stripe_session_uniq" ON "purchases" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "purchases_lead_idx" ON "purchases" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "purchases_status_idx" ON "purchases" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_snapshots_lead_tool_period_uniq" ON "tool_snapshots" USING btree ("lead_id","tool","period_month");--> statement-breakpoint
CREATE INDEX "tool_snapshots_lead_tool_idx" ON "tool_snapshots" USING btree ("lead_id","tool");--> statement-breakpoint
CREATE UNIQUE INDEX "venue_profiles_lead_uniq" ON "venue_profiles" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "video_events_lead_idx" ON "video_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "video_events_type_idx" ON "video_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "video_events_created_at_idx" ON "video_events" USING btree ("created_at");