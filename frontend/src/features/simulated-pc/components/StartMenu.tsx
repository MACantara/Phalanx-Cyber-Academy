import { useSimulatedPC } from '../context/SimulatedPCContext';

interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { level, openWindow } = useSimulatedPC();

  const levelApps: { id: string; title: string }[] = [
    { id: 'browser', title: 'Web Browser' },
    { id: 'email', title: 'Email Client' },
    { id: 'terminal', title: 'Terminal' },
    { id: 'process-monitor', title: 'Process Monitor' },
  ];

  const handleClick = (id: string, title: string) => {
    openWindow(id, title, '⚙️', id);
    onClose();
  };

  return (
    <div className="fixed bottom-12 left-2 z-[9998] w-56 rounded border border-gray-600 bg-gray-800 shadow-xl">
      <div className="border-b border-gray-600 bg-gray-700 px-3 py-2 text-sm font-semibold text-white">
        CyberOS Level {level.id}
      </div>
      <div className="p-2">
        {levelApps.map((app) => (
          <button
            key={app.id}
            onClick={() => handleClick(app.id, app.title)}
            className="w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-600"
          >
            {app.title}
          </button>
        ))}
      </div>
    </div>
  );
}
