import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ArrowRightLeft className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">SkillSwap</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className={`font-medium pb-2 transition-colors ${
                isActive('/') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}>
                Discover
              </a>
            </Link>
            <Link href="/swaps">
              <a className={`font-medium pb-2 transition-colors ${
                isActive('/swaps') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}>
                My Swaps
              </a>
            </Link>
            <Link href="/profile">
              <a className={`font-medium pb-2 transition-colors ${
                isActive('/profile') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}>
                Profile
              </a>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                2
              </Badge>
            </Button>

            {/* User Avatar */}
            <Link href="/profile">
              <a>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
