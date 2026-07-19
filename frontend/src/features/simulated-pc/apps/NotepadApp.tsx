import { useState } from 'react';

export function NotepadApp() {
  const [text, setText] = useState('');

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-600">Untitled - Notepad</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your notes here..."
        className="h-full w-full resize-none bg-white p-3 text-sm text-gray-900 outline-none"
      />
    </div>
  );
}
