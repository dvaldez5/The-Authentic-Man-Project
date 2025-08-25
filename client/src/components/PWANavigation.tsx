import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Dumbbell, PenTool, Users, Calendar, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePWANavigation } from "@/contexts/PWANavigationContext";

export default function PWANavigation() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();
  const { isVisible, showMore, setShowMore } = usePWANavigation();

  const isActive = (path: string) => location === path;

  const mainNavigationItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/learning", icon: BookOpen, label: "Learning" },
    { path: "/challenges", icon: Dumbbell, label: "Challenges" },
    { path: "/journal", icon: PenTool, label: "Journal" },
    { path: "/community", icon: Users, label: "Community" },
    { path: "/weekly-reflections", icon: Calendar, label: "Reflections" },
  ];

  const moreItems = [
    { path: "/blog", icon: FileText, label: "Blog" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Horizontally Scrollable Navigation */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center px-2 py-2 min-w-max">
            {/* All main navigation items */}
            {mainNavigationItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col items-center space-y-1 h-auto p-3 min-w-[70px] mx-1"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs whitespace-nowrap">{item.label}</span>
                </Button>
              </Link>
            ))}
            
            {/* Additional items */}
            {moreItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col items-center space-y-1 h-auto p-3 min-w-[70px] mx-1"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs whitespace-nowrap">{item.label}</span>
                </Button>
              </Link>
            ))}
            
            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 h-auto p-3 min-w-[70px] mx-1 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs whitespace-nowrap">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
}