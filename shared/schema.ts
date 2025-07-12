import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth + additional fields)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills catalog
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Proficiency levels enum
export const proficiencyLevel = pgEnum("proficiency_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

// Urgency levels enum
export const urgencyLevel = pgEnum("urgency_level", ["low", "medium", "high"]);

// User skills offered
export const userSkillsOffered = pgTable("user_skills_offered", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
  proficiencyLevel: proficiencyLevel("proficiency_level").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User skills wanted
export const userSkillsWanted = pgTable("user_skills_wanted", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
  urgencyLevel: urgencyLevel("urgency_level").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Swap status enum
export const swapStatus = pgEnum("swap_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
  "cancelled",
]);

// Swap requests
export const swapRequests = pgTable("swap_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterId: varchar("requester_id").references(() => users.id, { onDelete: "cascade" }),
  targetId: varchar("target_id").references(() => users.id, { onDelete: "cascade" }),
  requesterSkillId: uuid("requester_skill_id").references(() => skills.id),
  targetSkillId: uuid("target_skill_id").references(() => skills.id),
  message: text("message"),
  status: swapStatus("status").default("pending"),
  scheduledAt: timestamp("scheduled_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings and feedback
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  swapId: uuid("swap_id").references(() => swapRequests.id, { onDelete: "cascade" }),
  raterId: varchar("rater_id").references(() => users.id, { onDelete: "cascade" }),
  rateeId: varchar("ratee_id").references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  skillsOffered: many(userSkillsOffered),
  skillsWanted: many(userSkillsWanted),
  swapRequestsSent: many(swapRequests, { relationName: "requesterSwaps" }),
  swapRequestsReceived: many(swapRequests, { relationName: "targetSwaps" }),
  ratingsGiven: many(ratings, { relationName: "raterRatings" }),
  ratingsReceived: many(ratings, { relationName: "rateeRatings" }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  usersOffering: many(userSkillsOffered),
  usersWanting: many(userSkillsWanted),
}));

export const userSkillsOfferedRelations = relations(userSkillsOffered, ({ one }) => ({
  user: one(users, { fields: [userSkillsOffered.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkillsOffered.skillId], references: [skills.id] }),
}));

export const userSkillsWantedRelations = relations(userSkillsWanted, ({ one }) => ({
  user: one(users, { fields: [userSkillsWanted.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkillsWanted.skillId], references: [skills.id] }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one, many }) => ({
  requester: one(users, { fields: [swapRequests.requesterId], references: [users.id], relationName: "requesterSwaps" }),
  target: one(users, { fields: [swapRequests.targetId], references: [users.id], relationName: "targetSwaps" }),
  requesterSkill: one(skills, { fields: [swapRequests.requesterSkillId], references: [skills.id] }),
  targetSkill: one(skills, { fields: [swapRequests.targetSkillId], references: [skills.id] }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  swap: one(swapRequests, { fields: [ratings.swapId], references: [swapRequests.id] }),
  rater: one(users, { fields: [ratings.raterId], references: [users.id], relationName: "raterRatings" }),
  ratee: one(users, { fields: [ratings.rateeId], references: [users.id], relationName: "rateeRatings" }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  location: true,
  bio: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillOfferedSchema = createInsertSchema(userSkillsOffered).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillWantedSchema = createInsertSchema(userSkillsWanted).omit({
  id: true,
  createdAt: true,
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type UserSkillOffered = typeof userSkillsOffered.$inferSelect;
export type InsertUserSkillOffered = z.infer<typeof insertUserSkillOfferedSchema>;
export type UserSkillWanted = typeof userSkillsWanted.$inferSelect;
export type InsertUserSkillWanted = z.infer<typeof insertUserSkillWantedSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
