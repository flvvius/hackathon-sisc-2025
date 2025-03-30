import Navbar from "~/components/layout/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="font-work-sans dark:bg-background bg-white">
      <Navbar />
      {children}
    </main>
  );
}
