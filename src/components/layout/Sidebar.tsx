"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Home, KanbanSquare, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "~/hooks/use-media-query";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/ui/theme-toggle";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Navigation items
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Boards", href: "/dashboard", icon: KanbanSquare },
  ];

  // Update sidebar state based on screen size
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={cn(
        "fixed inset-y-0 z-30 flex flex-col border-r bg-white transition-all duration-300",
        isOpen ? "w-64" : "w-[70px]",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-purple-700"
        >
          <KanbanSquare className="h-6 w-6 flex-shrink-0" />
          {isOpen && <span>Track Thor</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="text-muted-foreground h-5 w-5" />
          ) : (
            <Menu className="text-muted-foreground h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className="flex flex-1 flex-col p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isOpen && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={cn(
          "flex items-center border-t p-4",
          isOpen ? "justify-between" : "justify-center",
        )}
      >
        {isOpen ? (
          <>
            <UserButton showName={isOpen} />
            <ThemeToggle size="sm" />
          </>
        ) : (
          <>
            <UserButton showName={isOpen} />
            <div className="mt-4">
              <ThemeToggle size="sm" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Mobile trigger
  const MobileTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-3.5 left-4 z-40 lg:hidden"
      onClick={() => setIsMobileOpen(true)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );

  // Mobile sidebar (using Sheet component)
  const MobileSidebar = (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-purple-700"
          >
            <KanbanSquare className="h-6 w-6" />
            <span>Track Thor</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col p-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-between border-t p-4">
          <UserButton showName={true} />
          <ThemeToggle size="sm" />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileTrigger}
      {MobileSidebar}
    </>
  );
}
