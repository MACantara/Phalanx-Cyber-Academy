const files = [
  { id: 1, name: 'Documents', type: 'folder' },
  { id: 2, name: 'Downloads', type: 'folder' },
  { id: 3, name: 'report.pdf', type: 'file' },
  { id: 4, name: 'scan_results.txt', type: 'file' },
];

export function FilesApp() {
  return (
    <div className="h-full bg-white p-4 text-gray-900">
      <h3 className="mb-4 font-semibold">File Explorer</h3>
      <div className="grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col items-center rounded border border-gray-200 p-4 text-center hover:bg-gray-100"
          >
            <span className="text-3xl">{file.type === 'folder' ? '📁' : '📄'}</span>
            <span className="mt-2 text-sm">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
