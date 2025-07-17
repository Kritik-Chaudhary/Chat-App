import { z } from "zod";

// User types
export type User = {
  id: number;
  username: string;
  avatarColor: string;
  isOnline: boolean;
  lastSeen: Date;
};

export const insertUserSchema = z.object({
  username: z.string().min(1).max(50),
  avatarColor: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Message types
export type Message = {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: Date;
};

export const insertMessageSchema = z.object({
  content: z.string().min(1).max(500),
  senderId: z.number(),
  senderName: z.string(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
