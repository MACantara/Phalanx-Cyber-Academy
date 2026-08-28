import { FileImage, FileText, Hexagon, Activity } from 'lucide-react';
import type { EvidenceItem } from '../types';

interface EvidenceViewerProps {
  item?: EvidenceItem;
}

const kindIcons: Record<EvidenceItem['kind'], typeof FileText> = {
  text: FileText,
  hex: Hexagon,
  packets: Activity,
  image: FileImage,
};

function renderImage(content: string, title: string) {
  const src = content.startsWith('data:') || content.startsWith('http')
    ? content
    : `data:image/png;base64,${content}`;
  return (
    <div className="flex flex-col items-center">
      <img
        src={src}
        alt={title}
        className="max-h-96 max-w-full rounded-lg border border-slate-600 object-contain"
      />
    </div>
  );
}

function renderHex(content: string) {
  return (
    <pre className="overflow-auto rounded bg-slate-950 p-4 font-mono text-xs text-green-400">
      {content}
    </pre>
  );
}

function renderPackets(content: string) {
  return (
    <pre className="overflow-auto rounded bg-slate-950 p-4 font-mono text-xs text-blue-300">
      {content}
    </pre>
  );
}

function renderText(content: string) {
  return (
    <pre className="overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-4 font-mono text-xs text-slate-300">
      {content}
    </pre>
  );
}

export function EvidenceViewer({ item }: EvidenceViewerProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-600 bg-slate-900 p-6 text-slate-400">
        Select an evidence item to view
      </div>
    );
  }

  const Icon = kindIcons[item.kind] ?? FileText;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-600 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
        <Icon className="h-5 w-5 text-blue-400" />
        <h4 className="font-semibold text-white">{item.title}</h4>
        <span className="ml-auto rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
          {item.kind}
        </span>
      </div>
      {item.description && (
        <p className="mb-3 text-sm text-slate-400">{item.description}</p>
      )}
      <div className="flex-1 overflow-auto">
        {item.kind === 'image' && renderImage(item.content, item.title)}
        {item.kind === 'hex' && renderHex(item.content)}
        {item.kind === 'packets' && renderPackets(item.content)}
        {item.kind === 'text' && renderText(item.content)}
      </div>
    </div>
  );
}
