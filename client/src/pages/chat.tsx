import { useState, useEffect } from "react";
import { Menu, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import UserSidebar from "@/components/user-sidebar";
import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import LogoutModal from "@/components/logout-modal";
import type { User, InsertUser } from "@shared/schema";
import { MessageCacheManager } from "@/lib/message-cache";

const STORAGE_KEY = "chatapp_user";

const avatarColors = [
  "bg-blue-500",
  "bg-amber-500", 
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500"
];

export default function Chat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Update online status when user loads from storage
        updateUserStatus(user.id, true);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const updateUserStatus = async (userId: number, isOnline: boolean) => {
    try {
      await apiRequest("PATCH", `/api/users/${userId}/status`, { isOnline });
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (user: User) => {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      queryClient.invalidateQueries({ queryKey: ["/api/users/online"] });
      toast({
        title: "Welcome!",
        description: `Successfully joined the chat as ${user.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsJoining(true);
    
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    
    createUserMutation.mutate({
      username: username.trim(),
      avatarColor: randomColor,
    });
    
    setIsJoining(false);
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    if (currentUser) {
      // Update user offline status
      await updateUserStatus(currentUser.id, false);
    }
    
    // Clear local storage and state
    localStorage.removeItem(STORAGE_KEY);
    MessageCacheManager.getInstance().clearCache();
    setCurrentUser(null);
    setLogoutModalOpen(false);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/users/online"] });
    queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    
    toast({
      title: "Logged out",
      description: "Your data and message history have been cleared successfully",
    });
  };

  // Update user status to offline when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        updateUserStatus(currentUser.id, false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentUser]);

  // Login form for new users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Join Chat</h1>
            <p className="text-slate-600 mt-2">Enter your username to start chatting</p>
          </div>
          
          <form onSubmit={handleJoinChat} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isJoining}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={!username.trim() || isJoining}
              className="w-full bg-blue-500 hover:bg-blue-600 py-3"
            >
              {isJoining ? "Joining..." : "Join Chat"}
            </Button>
          </form>

          {/* Helper text */}
          <div className="mt-4 text-center text-sm text-slate-600">
            If you used this username before, you'll automatically rejoin as the same user.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <header className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Global Chat Room</h1>
                <p className="text-sm text-slate-600">Share messages with everyone</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <Wifi className="w-4 h-4 text-green-500" />
                <span>Connected</span>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <MessageList 
          currentUserId={currentUser.id} 
          currentUserName={currentUser.username}
        />
        
        <MessageInput 
          currentUserId={currentUser.id}
          currentUserName={currentUser.username}
        />
      </main>

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
