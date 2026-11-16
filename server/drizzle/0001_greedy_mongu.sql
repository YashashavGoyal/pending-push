CREATE TYPE "public"."post_format" AS ENUM('article', 'dev_log', 'tutorial', 'confession');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "format" "post_format" DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_posts_format_feed" ON "posts" USING btree ("format","status","published_at");