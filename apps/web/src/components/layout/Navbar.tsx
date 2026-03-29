"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Menu, Search, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: settingsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`,
    fetcher
  );

  const siteName = settingsData?.data?.site_name || "Skill-Share";

  const navLinks = [
    { title: "首页", href: "/" },
    { title: "博客", href: "/blog" },
    { title: "社区", href: "/community" },
    { title: "关于", href: "/about" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("search", searchTerm);
      // Clear category when searching to provide a global search result
      params.delete("category");
    } else {
      params.delete("search");
    }
    
    // If we are on blog pages, stay on blog search
    const targetPath = pathname.startsWith("/blog") ? "/blog" : "/";
    router.push(`${targetPath}?${params.toString()}`);
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-6 md:px-12 lg:px-20">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-left font-bold text-xl">
                {siteName}
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="block px-2 py-1 text-lg"
                >
                  {link.title}
                </Link>
              ))}
            </div>
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索技能..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </form>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-primary">
              {siteName}
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Right Section (Search, Theme, Auth) */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden lg:flex max-w-sm flex-1">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索技能、文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/50 pl-9 md:w-[300px]"
              />
            </form>
          </div>
          <ThemeToggle />
          <nav className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0 overflow-hidden border">
                  {mounted && session?.user ? (
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {session.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {mounted && session?.user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {session.user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>管理后台</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer w-full flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>个人设置</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signin" className="cursor-pointer border-none w-full h-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>立即登录</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}

