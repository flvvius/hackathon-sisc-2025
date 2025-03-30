"use client";

import { UserButton } from "@clerk/nextjs";
import { Home, KanbanSquare, Settings, User } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Boards", href: "/dashboard", icon: KanbanSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 z-10 flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-purple-700"
        >
          <KanbanSquare className="h-6 w-6" />
          <span>Trello Clone</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col p-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-center border-t p-4">
        <UserButton showName={true} />
      </div>
    </div>
  );
}
