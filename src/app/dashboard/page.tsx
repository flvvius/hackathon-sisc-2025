import KanbanBoard from "~/components/layout/KanbanBoard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 pt-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <p className="text-muted-foreground">Manage your tasks and projects</p>
      </header>
      <KanbanBoard />
    </div>
  );
}
