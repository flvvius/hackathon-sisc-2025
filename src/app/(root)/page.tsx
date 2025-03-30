"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, Layout, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="flex-1">
      <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-16 md:flex-row md:gap-16 md:py-24">
        <div
          className={`flex-1 space-y-6 transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Manage projects{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              effortlessly
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 md:text-xl">
            A powerful task management application that helps teams collaborate,
            organize, and track projects with ease.
          </p>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              className="h-auto bg-purple-600 px-8 py-6 text-lg text-white hover:bg-purple-700"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              className="h-auto border-purple-200 px-8 py-6 text-lg text-purple-700 hover:bg-purple-50"
              onClick={() => router.push("/demo")}
            >
              Watch Demo
            </Button>
          </div>
        </div>
        <div
          className={`flex-1 transition-all delay-300 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-purple-100 shadow-2xl md:h-[400px]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90">
              <div className="absolute top-4 right-4 left-4 h-8 rounded-md bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute top-16 right-[40%] bottom-4 left-4 rounded-md bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute top-16 right-4 bottom-4 left-[64%] rounded-md bg-white/10 backdrop-blur-sm"></div>
              <div className="absolute top-20 left-8 h-24 w-32 rounded-md bg-white/20 p-2 backdrop-blur-sm"></div>
              <div className="absolute top-20 left-[calc(40%-4rem)] h-24 w-32 rounded-md bg-white/20 p-2 backdrop-blur-sm"></div>
              <div className="absolute top-20 left-[calc(64%+1rem)] h-24 w-32 rounded-md bg-white/20 p-2 backdrop-blur-sm"></div>
              <div className="absolute top-[calc(20rem-2rem)] left-8 h-24 w-32 rounded-md bg-white/20 p-2 backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              className={`rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 transition-all delay-500 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Intuitive Boards</h3>
              <p className="text-gray-600">
                Create and customize boards to visualize your workflow and track
                progress in real-time.
              </p>
            </div>

            <div
              className={`rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 transition-all delay-600 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Team Collaboration</h3>
              <p className="text-gray-600">
                Invite team members, assign tasks, and communicate effectively
                within your projects.
              </p>
            </div>

            <div
              className={`rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 transition-all delay-700 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Task Management</h3>
              <p className="text-gray-600">
                Break down projects into manageable tasks, set deadlines, and
                track completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-16 text-white md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to boost your productivity?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-purple-100">
            Join thousands of teams who use TaskFlow to organize their work and
            achieve more together.
          </p>
          <Button
            className="h-auto bg-white px-8 py-6 text-lg text-purple-700 hover:bg-purple-50"
            onClick={() => router.push("/dashboard")}
          >
            Get Started for Free
          </Button>
        </div>
      </section>
    </main>
  );
}
