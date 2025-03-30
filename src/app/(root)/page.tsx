"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Trello <span className="text-purple-400">Clone</span>
        </h1>
        <p className="max-w-2xl text-center text-xl">
          A simple and effective task management application built with Next.js,
          React DnD, and modern web technologies.
        </p>
        <div className="flex gap-4">
          <Button
            className="bg-white text-purple-900 hover:bg-purple-100"
            size="lg"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            size="lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}
