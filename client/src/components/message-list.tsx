import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Message } from "@shared/schema";

interface MessageListProps {
  currentUserId: number;
  currentUserName: string;
}

export default function MessageList({ currentUserId, currentUserName }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date | string | undefined) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-500">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-slate-500">
            <div className="text-lg mb-2">👋</div>
            <div className="text-sm">No messages yet. Start the conversation!</div>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isCurrentUser && (
                  <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {message.senderName[0].toUpperCase()}
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-2 ${
                  isCurrentUser 
                    ? 'bg-blue-500 text-white rounded-tr-md' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-md'
                }`}>
                  {!isCurrentUser && (
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {formatTime(message.timestamp!)}
                  </p>
                </div>
                
                {isCurrentUser && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {currentUserName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
