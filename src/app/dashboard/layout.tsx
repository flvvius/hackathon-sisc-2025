"use client";

import { DndProviderWrapper } from "~/components/providers/dnd-provider";
import Sidebar from "~/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DndProviderWrapper>
      <div className="dark:bg-background flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </DndProviderWrapper>
  );
}
