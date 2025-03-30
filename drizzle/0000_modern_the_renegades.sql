CREATE TYPE "public"."board_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."card_type" AS ENUM('project', 'comment');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in-progress', 'completed');--> statement-breakpoint
CREATE TABLE "hackathon_board_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boardId" uuid NOT NULL,
	"userId" varchar(256) NOT NULL,
	"role" "board_role" DEFAULT 'member' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_board" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"userId" varchar(256) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"type" varchar(32) DEFAULT 'project' NOT NULL,
	"listId" uuid NOT NULL,
	"author" varchar(256),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"author" varchar(256) NOT NULL,
	"projectCardId" uuid,
	"taskId" uuid,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_contributor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"role" varchar(256),
	"avatar" varchar(512),
	"userId" varchar(256),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_label" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar(64) NOT NULL,
	"color" varchar(32) NOT NULL,
	"boardId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"boardId" uuid NOT NULL,
	"position" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_project_contributor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectCardId" uuid NOT NULL,
	"contributorId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_project_label" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectCardId" uuid NOT NULL,
	"labelId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_task_assignee" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"contributorId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_task_label" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"labelId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathon_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"projectCardId" uuid NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"position" integer NOT NULL,
	"dueDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hackathon_user" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" varchar(256),
	"imageUrl" varchar(512),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "hackathon_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "hackathon_board_member" ADD CONSTRAINT "hackathon_board_member_boardId_hackathon_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."hackathon_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_board_member" ADD CONSTRAINT "hackathon_board_member_userId_hackathon_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."hackathon_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_board" ADD CONSTRAINT "hackathon_board_userId_hackathon_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."hackathon_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_card" ADD CONSTRAINT "hackathon_card_listId_hackathon_list_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."hackathon_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_comment" ADD CONSTRAINT "hackathon_comment_projectCardId_hackathon_card_id_fk" FOREIGN KEY ("projectCardId") REFERENCES "public"."hackathon_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_comment" ADD CONSTRAINT "hackathon_comment_taskId_hackathon_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."hackathon_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_contributor" ADD CONSTRAINT "hackathon_contributor_userId_hackathon_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."hackathon_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_label" ADD CONSTRAINT "hackathon_label_boardId_hackathon_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."hackathon_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_list" ADD CONSTRAINT "hackathon_list_boardId_hackathon_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."hackathon_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_project_contributor" ADD CONSTRAINT "hackathon_project_contributor_projectCardId_hackathon_card_id_fk" FOREIGN KEY ("projectCardId") REFERENCES "public"."hackathon_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_project_contributor" ADD CONSTRAINT "hackathon_project_contributor_contributorId_hackathon_contributor_id_fk" FOREIGN KEY ("contributorId") REFERENCES "public"."hackathon_contributor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_project_label" ADD CONSTRAINT "hackathon_project_label_projectCardId_hackathon_card_id_fk" FOREIGN KEY ("projectCardId") REFERENCES "public"."hackathon_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_project_label" ADD CONSTRAINT "hackathon_project_label_labelId_hackathon_label_id_fk" FOREIGN KEY ("labelId") REFERENCES "public"."hackathon_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_task_assignee" ADD CONSTRAINT "hackathon_task_assignee_taskId_hackathon_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."hackathon_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_task_assignee" ADD CONSTRAINT "hackathon_task_assignee_contributorId_hackathon_contributor_id_fk" FOREIGN KEY ("contributorId") REFERENCES "public"."hackathon_contributor"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_task_label" ADD CONSTRAINT "hackathon_task_label_taskId_hackathon_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."hackathon_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_task_label" ADD CONSTRAINT "hackathon_task_label_labelId_hackathon_label_id_fk" FOREIGN KEY ("labelId") REFERENCES "public"."hackathon_label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_task" ADD CONSTRAINT "hackathon_task_projectCardId_hackathon_card_id_fk" FOREIGN KEY ("projectCardId") REFERENCES "public"."hackathon_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "board_member_idx" ON "hackathon_board_member" USING btree ("boardId","userId");--> statement-breakpoint
CREATE INDEX "board_member_user_idx" ON "hackathon_board_member" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "board_user_idx" ON "hackathon_board" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "card_list_idx" ON "hackathon_card" USING btree ("listId");--> statement-breakpoint
CREATE INDEX "comment_project_idx" ON "hackathon_comment" USING btree ("projectCardId");--> statement-breakpoint
CREATE INDEX "comment_task_idx" ON "hackathon_comment" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "label_board_idx" ON "hackathon_label" USING btree ("boardId");--> statement-breakpoint
CREATE INDEX "list_board_idx" ON "hackathon_list" USING btree ("boardId");--> statement-breakpoint
CREATE INDEX "project_contributor_idx" ON "hackathon_project_contributor" USING btree ("projectCardId","contributorId");--> statement-breakpoint
CREATE INDEX "project_label_idx" ON "hackathon_project_label" USING btree ("projectCardId","labelId");--> statement-breakpoint
CREATE INDEX "task_assignee_idx" ON "hackathon_task_assignee" USING btree ("taskId","contributorId");--> statement-breakpoint
CREATE INDEX "task_label_idx" ON "hackathon_task_label" USING btree ("taskId","labelId");--> statement-breakpoint
CREATE INDEX "task_project_idx" ON "hackathon_task" USING btree ("projectCardId");--> statement-breakpoint
CREATE INDEX "email_idx" ON "hackathon_user" USING btree ("email");