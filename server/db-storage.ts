import { eq, desc, gt } from "drizzle-orm";
import { db } from "./db";
import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      isOnline: true,
      lastSeen: new Date()
    }).returning();
    return result[0];
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await db.update(users)
      .set({ isOnline, lastSeen: new Date() })
      .where(eq(users.id, id));
  }

  async getOnlineUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isOnline, true));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values({
      ...message,
      timestamp: new Date()
    }).returning();
    return result[0];
  }

  async getMessages(limit: number = 100): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .orderBy(desc(messages.timestamp))
      .limit(limit)
      .then(msgs => msgs.reverse()); // Return in chronological order
  }

  async getMessagesAfter(timestamp: Date): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(gt(messages.timestamp, timestamp))
      .orderBy(messages.timestamp);
  }
}