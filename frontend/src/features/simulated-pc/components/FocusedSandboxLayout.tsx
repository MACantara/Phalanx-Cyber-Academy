interface FocusedSandboxLayoutProps {
  title: string;
  instructions?: string;
  children: React.ReactNode;
}

export function FocusedSandboxLayout({ title, instructions, children }: FocusedSandboxLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold">{title}</h1>
        {instructions && <p className="mt-1 text-sm text-slate-300">{instructions}</p>}
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
