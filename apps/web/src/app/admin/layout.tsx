"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  ExternalLink,
  ShieldCheck,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarItemProps {
  href: string;
  icon: any;
  title: string;
  active: boolean;
  collapsed?: boolean;
}

function SidebarItem({ href, icon: Icon, title, active, collapsed }: SidebarItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 transition-all duration-200",
          active ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground",
          collapsed ? "px-2 justify-center" : "px-4"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
        {!collapsed && <span className="font-medium">{title}</span>}
      </Button>
    </Link>
  );
}

const sidebarItems = [
  { title: "总览", icon: LayoutDashboard, href: "/admin" },
  { title: "博客管理", icon: FileText, href: "/admin/blog" },
  { title: "用户管理", icon: Users, href: "/admin/users" },
  { title: "操作日志", icon: History, href: "/admin/audit-logs" },
  { title: "系统设置", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SidebarContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full py-6">
      <div className={cn("px-6 mb-10 flex items-center gap-2", collapsed && "px-2 justify-center")}>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight">管理中心</span>}
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.title}
            href={item.href}
            icon={item.icon}
            title={item.title}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="px-3 mt-auto pt-6 border-t border-border/50">
        <Link href="/" target="_blank">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed ? "px-2 justify-center" : "px-4"
            )}
          >
            <ExternalLink className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-medium">预览前台系统</span>}
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out border-r bg-muted/30 backdrop-blur-sm",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="relative h-full">
          <SidebarContent collapsed={isCollapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-accent hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed bottom-6 right-6 h-12 w-12 rounded-full border bg-background shadow-lg z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="h-full">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted));
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground)/0.3);
        }
      `}</style>
    </div>
  );
}
