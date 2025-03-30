import KanbanBoard from "~/components/layout/KanbanBoard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserInDb } from "~/lib/auth";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure user exists in our database
  await ensureUserInDb();

  return (
    <div className="container mx-auto p-4 pt-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <p className="text-muted-foreground">Manage your tasks and projects</p>
      </header>
      <KanbanBoard userId={userId} />
    </div>
  );
}
