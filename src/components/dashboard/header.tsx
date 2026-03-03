"use client";

import { Bell, Search, User, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { useCRM } from "@/lib/crm-context";

export function Header() {
  const router = useRouter();
  const { auth, logout, settings } = useCRM();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userName = auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : `${settings.profile.firstName} ${settings.profile.lastName}`;
  const userEmail = auth.user?.email || settings.profile.email;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-bg-secondary border-b border-border-default flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search... (Cmd+K)"
            className="w-full bg-bg-tertiary border border-border-default rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-bg-secondary border border-border-default rounded text-text-muted">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-danger rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(userName)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary">{userName}</p>
              <p className="text-xs text-text-muted">{userEmail || "Administrator"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-tertiary border border-border-default rounded-lg shadow-lg py-1 animate-fade-in z-50">
              <button
                onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-danger hover:bg-bg-elevated"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
