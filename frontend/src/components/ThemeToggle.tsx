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
        className="flex items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
        aria-label="Select theme"
      >
        <ActiveIcon className="h-5 w-5" />
        <span className="hidden text-sm sm:inline">{theme[0].toUpperCase() + theme.slice(1)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {options.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
