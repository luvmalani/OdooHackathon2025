import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertSkillSchema,
  insertUserSkillOfferedSchema,
  insertUserSkillWantedSchema,
  insertSwapRequestSchema,
  insertRatingSchema,
} from "@shared/schema";

// WebSocket manager for real-time features
class WebSocketManager {
  private connections = new Map<string, WebSocket>();

  addConnection(userId: string, ws: WebSocket) {
    this.connections.set(userId, ws);
  }

  removeConnection(userId: string) {
    this.connections.delete(userId);
  }

  sendToUser(userId: string, data: any) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(data: any) {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

const wsManager = new WebSocketManager();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Note: Auth routes are now handled in auth.ts
  // The following routes are available:
  // POST /api/register - Register new user
  // POST /api/login - Login user
  // POST /api/logout - Logout user
  // GET /api/user - Get current user

  // User routes
  app.get('/api/users/search', async (req, res) => {
    try {
      const { query, skillCategory, location, page = 1, limit = 12 } = req.query;
      const result = await storage.searchUsers({
        query: query as string,
        skillCategory: skillCategory as string,
        location: location as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      res.json(result);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get('/api/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const [skillsOffered, skillsWanted, averageRating] = await Promise.all([
        storage.getUserSkillsOffered(userId),
        storage.getUserSkillsWanted(userId),
        storage.getAverageRating(userId),
      ]);

      res.json({
        ...user,
        skillsOffered,
        skillsWanted,
        averageRating,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        ...userData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/skills/categories', async (req, res) => {
    try {
      const categories = await storage.getSkillsByCategory();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching skill categories:", error);
      res.status(500).json({ message: "Failed to fetch skill categories" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const newSkill = await storage.createSkill(skillData);
      res.json(newSkill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(400).json({ message: "Failed to create skill" });
    }
  });

  app.get('/api/skills/search', async (req, res) => {
    try {
      const { q } = req.query;
      const skills = await storage.searchSkills(q as string);
      res.json(skills);
    } catch (error) {
      console.error("Error searching skills:", error);
      res.status(500).json({ message: "Failed to search skills" });
    }
  });

  // User skills routes
  app.get('/api/users/skills/offered', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skills = await storage.getUserSkillsOffered(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching offered skills:", error);
      res.status(500).json({ message: "Failed to fetch offered skills" });
    }
  });

  app.post('/api/users/skills/offered', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillData = insertUserSkillOfferedSchema.parse({
        ...req.body,
        userId,
      });
      const newSkill = await storage.addUserSkillOffered(skillData);
      res.json(newSkill);
    } catch (error) {
      console.error("Error adding offered skill:", error);
      res.status(400).json({ message: "Failed to add offered skill" });
    }
  });

  app.delete('/api/users/skills/offered/:skillId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;
      await storage.removeUserSkillOffered(userId, skillId);
      res.json({ message: "Skill removed successfully" });
    } catch (error) {
      console.error("Error removing offered skill:", error);
      res.status(500).json({ message: "Failed to remove offered skill" });
    }
  });

  app.get('/api/users/skills/wanted', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skills = await storage.getUserSkillsWanted(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching wanted skills:", error);
      res.status(500).json({ message: "Failed to fetch wanted skills" });
    }
  });

  app.post('/api/users/skills/wanted', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillData = insertUserSkillWantedSchema.parse({
        ...req.body,
        userId,
      });
      const newSkill = await storage.addUserSkillWanted(skillData);
      res.json(newSkill);
    } catch (error) {
      console.error("Error adding wanted skill:", error);
      res.status(400).json({ message: "Failed to add wanted skill" });
    }
  });

  app.delete('/api/users/skills/wanted/:skillId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;
      await storage.removeUserSkillWanted(userId, skillId);
      res.json({ message: "Skill removed successfully" });
    } catch (error) {
      console.error("Error removing wanted skill:", error);
      res.status(500).json({ message: "Failed to remove wanted skill" });
    }
  });

  // Swap routes
  app.post('/api/swaps/request', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.id;
      const swapData = insertSwapRequestSchema.parse({
        ...req.body,
        requesterId,
      });
      
      const newSwap = await storage.createSwapRequest(swapData);
      
      // Send real-time notification to target user
      wsManager.sendToUser(swapData.targetId!, {
        type: 'new_swap_request',
        data: newSwap,
      });
      
      res.json(newSwap);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(400).json({ message: "Failed to create swap request" });
    }
  });

  app.get('/api/swaps/sent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const swaps = await storage.getUserSwapsSent(userId);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching sent swaps:", error);
      res.status(500).json({ message: "Failed to fetch sent swaps" });
    }
  });

  app.get('/api/swaps/received', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const swaps = await storage.getUserSwapsReceived(userId);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching received swaps:", error);
      res.status(500).json({ message: "Failed to fetch received swaps" });
    }
  });

  app.put('/api/swaps/:swapId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { swapId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      
      const swap = await storage.getSwapRequest(swapId);
      if (!swap) {
        return res.status(404).json({ message: "Swap request not found" });
      }
      
      // Only target user can accept/reject, requester can cancel
      if (swap.targetId !== userId && swap.requesterId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedSwap = await storage.updateSwapStatus(swapId, status);
      
      // Send real-time notification
      const notificationTarget = swap.targetId === userId ? swap.requesterId : swap.targetId;
      wsManager.sendToUser(notificationTarget!, {
        type: 'swap_status_update',
        data: updatedSwap,
      });
      
      res.json(updatedSwap);
    } catch (error) {
      console.error("Error updating swap status:", error);
      res.status(500).json({ message: "Failed to update swap status" });
    }
  });

  // Rating routes
  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const raterId = req.user.id;
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        raterId,
      });
      
      const newRating = await storage.createRating(ratingData);
      res.json(newRating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(400).json({ message: "Failed to create rating" });
    }
  });

  app.get('/api/users/:userId/ratings', async (req, res) => {
    try {
      const { userId } = req.params;
      const ratings = await storage.getUserRatings(userId);
      const averageRating = await storage.getAverageRating(userId);
      res.json({ ratings, averageRating });
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ message: "Failed to fetch user ratings" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      wsManager.addConnection(userId, ws);
      
      ws.on('close', () => {
        wsManager.removeConnection(userId);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        wsManager.removeConnection(userId);
      });
    }
  });

  return httpServer;
}
