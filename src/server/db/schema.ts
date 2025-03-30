import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hackathon_${name}`);

// Enums
export const cardTypeEnum = pgEnum("card_type", ["project", "comment"]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "completed",
]);
export const boardRoleEnum = pgEnum("board_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

// Users table
export const users = createTable(
  "user",
  (d) => ({
    id: d.varchar({ length: 256 }).primaryKey(),
    name: d.varchar({ length: 256 }),
    email: d.varchar({ length: 256 }).unique(),
    imageUrl: d.varchar({ length: 512 }),
    githubUsername: d.varchar({ length: 100 }),
    gitlabUsername: d.varchar({ length: 100 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("email_idx").on(t.email)],
);

// Boards table
export const boards = createTable(
  "board",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    userId: d
      .varchar({ length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("board_user_idx").on(t.userId)],
);

// Board Members table - for team members with access to a board
export const boardMembers = createTable(
  "board_member",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    boardId: d
      .uuid()
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: boardRoleEnum("role").notNull().default("member"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("board_member_idx").on(t.boardId, t.userId)],
);

// Lists table
export const lists = createTable(
  "list",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    title: d.varchar({ length: 256 }).notNull(),
    boardId: d
      .uuid()
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    position: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("list_board_idx").on(t.boardId)],
);

// Cards table (only projects and comments)
export const cards = createTable(
  "card",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    position: d.integer().default(0).notNull(),
    type: d.varchar({ length: 32 }).default("project").notNull(),
    status: taskStatusEnum("status").default("todo"),
    labels: d.json(),
    assignees: d.json(),
    listId: d
      .uuid()
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    author: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("card_list_idx").on(t.listId)],
);

// Tasks table (all tasks must be within project cards)
export const tasks = createTable(
  "task",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    projectCardId: d
      .uuid()
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    status: taskStatusEnum("status").notNull().default("todo"),
    position: d.integer().notNull(),
    dueDate: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("task_project_idx").on(t.projectCardId)],
);

// Contributors/Team Members table
export const contributors = createTable("contributor", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 256 }).notNull(),
  role: d.varchar({ length: 256 }),
  avatar: d.varchar({ length: 512 }),
  userId: d
    .varchar({ length: 256 })
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Project Contributors junction table
export const projectContributors = createTable(
  "project_contributor",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    projectCardId: d
      .uuid()
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    contributorId: d
      .uuid()
      .notNull()
      .references(() => contributors.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("project_contributor_idx").on(t.projectCardId, t.contributorId),
  ],
);

// Task Assignees junction table
export const taskAssignees = createTable(
  "task_assignee",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    taskId: d
      .uuid()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    contributorId: d
      .uuid()
      .notNull()
      .references(() => contributors.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("task_assignee_idx").on(t.taskId, t.contributorId)],
);

// Comments table
export const comments = createTable(
  "comment",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    text: d.text().notNull(),
    author: d.varchar({ length: 256 }).notNull(),
    // Can be associated with either a project card or a task
    projectCardId: d.uuid().references(() => cards.id, { onDelete: "cascade" }),
    taskId: d.uuid().references(() => tasks.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("comment_project_idx").on(t.projectCardId),
    index("comment_task_idx").on(t.taskId),
  ],
);

// Labels table
export const labels = createTable(
  "label",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    text: d.varchar({ length: 64 }).notNull(),
    color: d.varchar({ length: 32 }).notNull(),
    boardId: d
      .uuid()
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("label_board_idx").on(t.boardId)],
);

// Project Labels junction table
export const projectLabels = createTable(
  "project_label",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    projectCardId: d
      .uuid()
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    labelId: d
      .uuid()
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  }),
  (t) => [index("project_label_idx").on(t.projectCardId, t.labelId)],
);

// Task Labels junction table
export const taskLabels = createTable(
  "task_label",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    taskId: d
      .uuid()
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: d
      .uuid()
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  }),
  (t) => [index("task_label_idx").on(t.taskId, t.labelId)],
);

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  contributors: many(contributors),
  boardMemberships: many(boardMembers),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  user: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
  lists: many(lists),
  labels: many(labels),
  members: many(boardMembers),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id],
  }),
  tasks: many(tasks),
  projectContributors: many(projectContributors),
  comments: many(comments, { relationName: "projectComments" }),
  projectLabels: many(projectLabels),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  projectCard: one(cards, {
    fields: [tasks.projectCardId],
    references: [cards.id],
  }),
  assignees: many(taskAssignees),
  comments: many(comments, { relationName: "taskComments" }),
  taskLabels: many(taskLabels),
}));

export const contributorsRelations = relations(
  contributors,
  ({ one, many }) => ({
    user: one(users, {
      fields: [contributors.userId],
      references: [users.id],
    }),
    projects: many(projectContributors),
    assignedTasks: many(taskAssignees),
  }),
);

export const projectContributorsRelations = relations(
  projectContributors,
  ({ one }) => ({
    project: one(cards, {
      fields: [projectContributors.projectCardId],
      references: [cards.id],
    }),
    contributor: one(contributors, {
      fields: [projectContributors.contributorId],
      references: [contributors.id],
    }),
  }),
);

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  contributor: one(contributors, {
    fields: [taskAssignees.contributorId],
    references: [contributors.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  projectCard: one(cards, {
    fields: [comments.projectCardId],
    references: [cards.id],
    relationName: "projectComments",
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
    relationName: "taskComments",
  }),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  board: one(boards, {
    fields: [labels.boardId],
    references: [boards.id],
  }),
  projectLabels: many(projectLabels),
  taskLabels: many(taskLabels),
}));

export const projectLabelsRelations = relations(projectLabels, ({ one }) => ({
  projectCard: one(cards, {
    fields: [projectLabels.projectCardId],
    references: [cards.id],
  }),
  label: one(labels, {
    fields: [projectLabels.labelId],
    references: [labels.id],
  }),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));
