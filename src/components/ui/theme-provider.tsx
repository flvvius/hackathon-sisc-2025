"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Only render theme provider after mounting on the client to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by using default theme until mounted on client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider attribute="class" enableSystem={true} {...props}>
      {children}
    </NextThemesProvider>
  );
}
