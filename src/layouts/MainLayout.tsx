import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { icon: MessageCircle, label: '聊天', path: '/chat' },
  { icon: Users, label: '通讯录', path: '/contacts' },
  { icon: Settings, label: '设置', path: '/settings' },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Fetch user data on mount if not already loaded
    if (!user) {
      checkAuth();
    }
  }, [user, checkAuth]);

  // Show loading while fetching user data
  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background">
        {/* Left Navigation Bar */}
        <div className="w-16 bg-background-secondary border-r border-border flex flex-col items-center py-4">
          {/* User Avatar */}
          <div className="mb-6">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'w-12 h-12 rounded-12',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-12 text-text-tertiary hover:text-functional-error"
            onClick={() => {
              useAuthStore.getState().logout();
              navigate('/login');
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 min-w-0">
          <Outlet />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MainLayout;