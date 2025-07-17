import type { Message } from "@shared/schema";

const MESSAGE_CACHE_KEY = "chatapp_messages";
const MAX_CACHED_MESSAGES = 500; // Limit cache size to prevent localStorage bloat

export interface MessageCache {
  messages: Message[];
  lastSync: number;
}

export class MessageCacheManager {
  private static instance: MessageCacheManager;
  
  static getInstance(): MessageCacheManager {
    if (!MessageCacheManager.instance) {
      MessageCacheManager.instance = new MessageCacheManager();
    }
    return MessageCacheManager.instance;
  }

  /**
   * Get cached messages from localStorage
   */
  getCachedMessages(): Message[] {
    try {
      const cached = localStorage.getItem(MESSAGE_CACHE_KEY);
      if (!cached) return [];
      
      const data: MessageCache = JSON.parse(cached);
      return data.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
    } catch (error) {
      console.warn("Failed to load cached messages:", error);
      return [];
    }
  }

  /**
   * Save messages to localStorage
   */
  cacheMessages(messages: Message[]): void {
    try {
      // Sort messages by timestamp and keep only the most recent ones
      const sortedMessages = messages
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
          return aTime - bTime;
        })
        .slice(-MAX_CACHED_MESSAGES);

      const cacheData: MessageCache = {
        messages: sortedMessages,
        lastSync: Date.now()
      };

      localStorage.setItem(MESSAGE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Failed to cache messages:", error);
    }
  }

  /**
   * Add a new message to cache
   */
  addMessageToCache(message: Message): void {
    const cached = this.getCachedMessages();
    const updated = [...cached, message];
    this.cacheMessages(updated);
  }

  /**
   * Merge server messages with cached messages, removing duplicates
   */
  mergeWithServerMessages(serverMessages: Message[]): Message[] {
    const cached = this.getCachedMessages();
    const serverIds = new Set(serverMessages.map(msg => msg.id));
    
    // Normalize server messages to have Date objects
    const normalizedServerMessages = serverMessages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
    
    // Filter out cached messages that have duplicates in server messages
    // This includes temporary messages (with Date.now() IDs) that match server messages by content and sender
    const uniqueCached = cached.filter(cachedMsg => {
      // If message is already on server, remove it
      if (serverIds.has(cachedMsg.id)) {
        return false;
      }
      
      // Check if this cached message is a temporary message that matches a server message
      // (same content, sender, and timestamp within 5 seconds)
      const isTemporaryDuplicate = normalizedServerMessages.some(serverMsg => {
        const isSameContent = serverMsg.content === cachedMsg.content;
        const isSameSender = serverMsg.senderId === cachedMsg.senderId;
        const timeDiff = Math.abs(
          (serverMsg.timestamp?.getTime() || 0) - (cachedMsg.timestamp?.getTime() || 0)
        );
        const isWithinTimeWindow = timeDiff < 5000; // 5 seconds
        
        return isSameContent && isSameSender && isWithinTimeWindow;
      });
      
      return !isTemporaryDuplicate;
    });
    
    // Combine and sort all messages
    const allMessages = [...normalizedServerMessages, ...uniqueCached];
    
    // Remove duplicates and sort by timestamp
    const messageMap = new Map();
    allMessages.forEach(msg => {
      messageMap.set(msg.id, msg);
    });
    
    const mergedMessages = Array.from(messageMap.values())
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
        return aTime - bTime;
      });
    
    // Update cache with merged results
    this.cacheMessages(mergedMessages);
    
    return mergedMessages;
  }

  /**
   * Clear all cached messages
   */
  clearCache(): void {
    try {
      localStorage.removeItem(MESSAGE_CACHE_KEY);
    } catch (error) {
      console.warn("Failed to clear message cache:", error);
    }
  }

  /**
   * Get timestamp of last cache update
   */
  getLastSyncTime(): Date | null {
    try {
      const cached = localStorage.getItem(MESSAGE_CACHE_KEY);
      if (!cached) return null;
      
      const data: MessageCache = JSON.parse(cached);
      return new Date(data.lastSync);
    } catch (error) {
      return null;
    }
  }
}