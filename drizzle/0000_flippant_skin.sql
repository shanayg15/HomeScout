CREATE TABLE "lookups" (
	"slug" text PRIMARY KEY NOT NULL,
	"dossier" jsonb NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
