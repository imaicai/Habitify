import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Plus, 
  Trophy, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';
import { getUser } from '@/lib/storage';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/create', icon: Plus, label: '新建' },
  { path: '/rewards', icon: Trophy, label: '奖励' },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export const Navbar = () => {
  const location = useLocation();
  const user = getUser();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-6 bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-primary p-2 rounded-xl shadow-soft group-hover:shadow-glow transition-smooth">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                习惯养成
              </h1>
              <p className="text-xs text-muted-foreground">专注成长每一天</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {navItems.slice(1, -1).map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    location.pathname === item.path && "bg-gradient-primary text-white shadow-soft"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-energy text-white px-3 py-1 gap-2 shadow-soft">
            <Zap className="h-3 w-3" />
            <span className="font-medium">{user.totalEnergy} 能量</span>
          </Badge>
          
          <Link to="/settings">
            <Button
              variant={location.pathname === '/settings' ? "default" : "ghost"}
              size="sm"
              className={cn(
                "gap-2",
                location.pathname === '/settings' && "bg-gradient-primary text-white shadow-soft"
              )}
            >
              <Settings className="h-4 w-4" />
              设置
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-smooth min-w-0",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "drop-shadow-sm"
                )} />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Energy Badge */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Badge className="bg-gradient-energy text-white px-3 py-2 gap-2 shadow-medium">
          <Zap className="h-4 w-4" />
          <span className="font-semibold">{user.totalEnergy}</span>
        </Badge>
      </div>
    </>
  );
};