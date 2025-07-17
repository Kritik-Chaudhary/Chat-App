import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Menu, Users, Circle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

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

export default function UserSidebar({ isOpen, onClose, onLogout }: UserSidebarProps) {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/online"],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-80 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } absolute md:relative z-30 h-full`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Connected Users</h2>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2">
            <span className="text-sm text-slate-600">
              <Circle className="w-3 h-3 text-green-500 inline mr-1" />
              {users.length} users online
            </span>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No users online</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-8 h-8 ${user.avatarColor || 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{user.username}</div>
                    <div className="text-xs text-slate-600">Active now</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Logout & Clear Data
          </Button>
        </div>
      </aside>
    </>
  );
}
