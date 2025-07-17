import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertMessage, Message } from "@shared/schema";

interface MessageInputProps {
  currentUserId: number;
  currentUserName: string;
}

export default function MessageInput({ currentUserId, currentUserName }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: InsertMessage) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onMutate: async (messageData: InsertMessage) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/messages"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/messages"]);

      // Optimistically update to the new value
      const tempMessage: Message = {
        id: Date.now(), // Temporary ID
        content: messageData.content,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: new Date()
      };

      queryClient.setQueryData<Message[]>(["/api/messages"], (old) => {
        return old ? [...old, tempMessage] : [tempMessage];
      });

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onSuccess: (serverMessage: Message) => {
      // Message sent successfully, invalidate to get latest data
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/messages"], context?.previousMessages);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      return;
    }

    sendMessageMutation.mutate({
      content: trimmedMessage,
      senderId: currentUserId,
      senderName: currentUserName,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="p-4 border-t border-slate-200 bg-slate-50">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-12 py-3 rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-500 hover:text-slate-700"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-2xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
