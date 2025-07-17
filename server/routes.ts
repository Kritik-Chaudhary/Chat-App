import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists and is currently online
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser && existingUser.isOnline) {
        return res.status(400).json({ message: "Username is currently in use" });
      }
      
      // If user exists but is offline, reactivate them
      if (existingUser && !existingUser.isOnline) {
        await storage.updateUserOnlineStatus(existingUser.id, true);
        const reactivatedUser = await storage.getUser(existingUser.id);
        res.json(reactivatedUser);
      } else {
        // Create new user
        const user = await storage.createUser(userData);
        res.json(user);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/online", async (req, res) => {
    try {
      const users = await storage.getOnlineUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  app.patch("/api/users/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isOnline } = req.body;
      
      if (typeof isOnline !== "boolean") {
        return res.status(400).json({ message: "isOnline must be a boolean" });
      }
      
      await storage.updateUserOnlineStatus(id, isOnline);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/since", async (req, res) => {
    try {
      const timestamp = req.query.timestamp as string;
      if (!timestamp) {
        return res.status(400).json({ message: "Timestamp is required" });
      }
      
      const since = new Date(timestamp);
      const messages = await storage.getMessagesAfter(since);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch new messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
