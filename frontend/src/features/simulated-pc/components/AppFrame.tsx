interface AppFrameProps {
  title: string;
  instructions?: string;
  children: React.ReactNode;
}

export function AppFrame({ title, instructions, children }: AppFrameProps) {
  return (
    <div className="flex h-full flex-col bg-stock text-ink">
      <header className="flex items-center gap-3 border-b border-ink bg-stock px-4 py-3 sm:px-5">
        <span className="plate-id">PLT-01</span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-wide">{title}</h1>
          {instructions && <p className="register mt-0.5 truncate normal-case tracking-normal">{instructions}</p>}
        </div>
        <div className="ml-auto flex gap-1.5" aria-hidden="true">
          <span className="block h-3 w-3 border border-ink" />
          <span className="block h-3 w-3 bg-ink" />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
