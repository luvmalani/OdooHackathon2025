import {
  users,
  skills,
  userSkillsOffered,
  userSkillsWanted,
  swapRequests,
  ratings,
  type User,
  type UpsertUser,
  type Skill,
  type InsertSkill,
  type UserSkillOffered,
  type InsertUserSkillOffered,
  type UserSkillWanted,
  type InsertUserSkillWanted,
  type SwapRequest,
  type InsertSwapRequest,
  type Rating,
  type InsertRating,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  
  // User search and discovery
  searchUsers(params: {
    query?: string;
    skillCategory?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }>;
  
  // Skills operations
  getAllSkills(): Promise<Skill[]>;
  getSkillsByCategory(): Promise<{ category: string; skills: Skill[] }[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  searchSkills(query: string): Promise<Skill[]>;
  
  // User skills operations
  getUserSkillsOffered(userId: string): Promise<(UserSkillOffered & { skill: Skill })[]>;
  getUserSkillsWanted(userId: string): Promise<(UserSkillWanted & { skill: Skill })[]>;
  addUserSkillOffered(userSkill: InsertUserSkillOffered): Promise<UserSkillOffered>;
  addUserSkillWanted(userSkill: InsertUserSkillWanted): Promise<UserSkillWanted>;
  removeUserSkillOffered(userId: string, skillId: string): Promise<void>;
  removeUserSkillWanted(userId: string, skillId: string): Promise<void>;
  
  // Swap operations
  createSwapRequest(swap: InsertSwapRequest): Promise<SwapRequest>;
  getUserSwapsSent(userId: string): Promise<SwapRequest[]>;
  getUserSwapsReceived(userId: string): Promise<SwapRequest[]>;
  getSwapRequest(id: string): Promise<SwapRequest | undefined>;
  updateSwapStatus(id: string, status: string): Promise<SwapRequest>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getUserRatings(userId: string): Promise<Rating[]>;
  getAverageRating(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async searchUsers(params: {
    query?: string;
    skillCategory?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;
    
    let whereConditions = [eq(users.isActive, true)];
    
    if (params.query) {
      whereConditions.push(
        or(
          ilike(users.firstName, `%${params.query}%`),
          ilike(users.lastName, `%${params.query}%`),
          ilike(users.location, `%${params.query}%`)
        )!
      );
    }
    
    if (params.location && params.location !== "All Locations") {
      whereConditions.push(ilike(users.location, `%${params.location}%`));
    }

    const [userResults, totalResults] = await Promise.all([
      db
        .select()
        .from(users)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt)),
      db
        .select({ count: count() })
        .from(users)
        .where(and(...whereConditions)),
    ]);

    return {
      users: userResults,
      total: totalResults[0]?.count || 0,
    };
  }

  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(skills.category, skills.name);
  }

  async getSkillsByCategory(): Promise<{ category: string; skills: Skill[] }[]> {
    const allSkills = await this.getAllSkills();
    const categorized = allSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    return Object.entries(categorized).map(([category, skills]) => ({
      category,
      skills,
    }));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async searchSkills(query: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(
        or(
          ilike(skills.name, `%${query}%`),
          ilike(skills.description, `%${query}%`)
        )
      )
      .orderBy(skills.name);
  }

  async getUserSkillsOffered(userId: string): Promise<(UserSkillOffered & { skill: Skill })[]> {
    return await db
      .select({
        id: userSkillsOffered.id,
        userId: userSkillsOffered.userId,
        skillId: userSkillsOffered.skillId,
        proficiencyLevel: userSkillsOffered.proficiencyLevel,
        description: userSkillsOffered.description,
        isActive: userSkillsOffered.isActive,
        createdAt: userSkillsOffered.createdAt,
        skill: {
          id: skills.id,
          name: skills.name,
          category: skills.category,
          description: skills.description,
          isApproved: skills.isApproved,
          createdAt: skills.createdAt,
        },
      })
      .from(userSkillsOffered)
      .innerJoin(skills, eq(userSkillsOffered.skillId, skills.id))
      .where(eq(userSkillsOffered.userId, userId));
  }

  async getUserSkillsWanted(userId: string): Promise<(UserSkillWanted & { skill: Skill })[]> {
    return await db
      .select({
        id: userSkillsWanted.id,
        userId: userSkillsWanted.userId,
        skillId: userSkillsWanted.skillId,
        urgencyLevel: userSkillsWanted.urgencyLevel,
        description: userSkillsWanted.description,
        isActive: userSkillsWanted.isActive,
        createdAt: userSkillsWanted.createdAt,
        skill: {
          id: skills.id,
          name: skills.name,
          category: skills.category,
          description: skills.description,
          isApproved: skills.isApproved,
          createdAt: skills.createdAt,
        },
      })
      .from(userSkillsWanted)
      .innerJoin(skills, eq(userSkillsWanted.skillId, skills.id))
      .where(eq(userSkillsWanted.userId, userId));
  }

  async addUserSkillOffered(userSkill: InsertUserSkillOffered): Promise<UserSkillOffered> {
    const [newSkill] = await db.insert(userSkillsOffered).values(userSkill).returning();
    return newSkill;
  }

  async addUserSkillWanted(userSkill: InsertUserSkillWanted): Promise<UserSkillWanted> {
    const [newSkill] = await db.insert(userSkillsWanted).values(userSkill).returning();
    return newSkill;
  }

  async removeUserSkillOffered(userId: string, skillId: string): Promise<void> {
    await db
      .delete(userSkillsOffered)
      .where(
        and(
          eq(userSkillsOffered.userId, userId),
          eq(userSkillsOffered.skillId, skillId)
        )
      );
  }

  async removeUserSkillWanted(userId: string, skillId: string): Promise<void> {
    await db
      .delete(userSkillsWanted)
      .where(
        and(
          eq(userSkillsWanted.userId, userId),
          eq(userSkillsWanted.skillId, skillId)
        )
      );
  }

  async createSwapRequest(swap: InsertSwapRequest): Promise<SwapRequest> {
    const [newSwap] = await db.insert(swapRequests).values(swap).returning();
    return newSwap;
  }

  async getUserSwapsSent(userId: string): Promise<SwapRequest[]> {
    return await db
      .select()
      .from(swapRequests)
      .where(eq(swapRequests.requesterId, userId))
      .orderBy(desc(swapRequests.createdAt));
  }

  async getUserSwapsReceived(userId: string): Promise<SwapRequest[]> {
    return await db
      .select()
      .from(swapRequests)
      .where(eq(swapRequests.targetId, userId))
      .orderBy(desc(swapRequests.createdAt));
  }

  async getSwapRequest(id: string): Promise<SwapRequest | undefined> {
    const [swap] = await db.select().from(swapRequests).where(eq(swapRequests.id, id));
    return swap;
  }

  async updateSwapStatus(id: string, status: string): Promise<SwapRequest> {
    const [updatedSwap] = await db
      .update(swapRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(swapRequests.id, id))
      .returning();
    return updatedSwap;
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.rateeId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async getAverageRating(userId: string): Promise<number> {
    const userRatings = await this.getUserRatings(userId);
    if (userRatings.length === 0) return 0;
    
    const total = userRatings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / userRatings.length;
  }
}

export const storage = new DatabaseStorage();