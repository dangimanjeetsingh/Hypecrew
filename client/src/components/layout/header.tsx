import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar, Moon, Settings, Sun } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">HYPECREW</h1>
              </a>
            </Link>
            
            <div className="hidden md:block ml-10">
              <Link href="/calendar">
                <a className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  Calendar
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.isAdmin && (
              <Link href="/admin/events">
                <a className="text-muted-foreground hover:text-foreground">
                  <Settings className="h-6 w-6" />
                </a>
              </Link>
            )}
            
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden sm:block">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <a>
                  <Button>Login</Button>
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
