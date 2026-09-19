import { useState } from 'react';
import { useTheme, type Theme } from '../hooks/useTheme';
import { Monitor, Moon, Sun } from 'lucide-react';

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ActiveIcon = options.find((o) => o.value === theme)?.Icon ?? Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 border border-transparent p-2 text-ink-soft transition-colors hover:border-hairline hover:text-ink"
        aria-label="Select theme"
      >
        <ActiveIcon className="h-5 w-5" />
        <span className="register hidden sm:inline">{theme}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-44 border border-hairline bg-stock">
            {options.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink-soft hover:bg-stock-green hover:text-ink"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
