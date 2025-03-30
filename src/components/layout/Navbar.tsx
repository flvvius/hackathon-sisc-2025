"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "~/components/ui/theme-toggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-border border-b">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-foreground text-xl font-bold">
              Track Thor
            </span>
          </Link>
        </div>

        <div className="hidden md:ml-8 md:flex md:items-center md:space-x-4">
          <Link
            href="/"
            className="text-foreground/80 hover:text-primary text-sm font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-foreground/80 hover:text-primary text-sm font-medium transition-colors"
          >
            Boards
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm" className="mr-2">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link
                  href="/"
                  className="text-foreground hover:text-primary block px-2 py-1 text-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-primary block px-2 py-1 text-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Boards
                </Link>
                <div className="flex items-center gap-2 px-2 py-1">
                  <ThemeToggle />
                  <span className="text-foreground text-lg">Theme</span>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
