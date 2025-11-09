import Sidebar from "./components/siderbar";

export default function ProtectedLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Sidebar />

      {children}
    </section>
  );
}
