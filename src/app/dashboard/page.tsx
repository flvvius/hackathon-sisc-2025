import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { db } from "~/server/db";
import { boards } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Redirect to home if not signed in
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  // Get user's boards from the database
  const userBoards = await db.query.boards.findMany({
    where: userId ? eq(boards.userId, userId) : undefined,
    orderBy: (boards, { desc }) => [desc(boards.updatedAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Boards</h2>
          <Link
            href="/dashboard/boards/new"
            className="rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
          >
            Create New Board
          </Link>
        </div>

        {userBoards.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-6">
            <p className="mb-4 text-center text-lg">
              You don&apos;t have any boards yet.
            </p>
            <Link
              href="/dashboard/boards/new"
              className="rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
            >
              Create Your First Board
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {userBoards.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/boards/${board.id}`}
                className="flex h-32 flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <h3 className="text-lg font-medium">{board.title}</h3>
                {board.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/70">
                    {board.description}
                  </p>
                )}
                <div className="mt-2 text-xs text-white/50">
                  Last updated:{" "}
                  {new Date(
                    board.updatedAt ?? board.createdAt,
                  ).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
