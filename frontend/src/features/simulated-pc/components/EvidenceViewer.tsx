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
        className="max-h-96 max-w-full border border-hairline object-contain"
      />
    </div>
  );
}

function renderHex(content: string) {
  return (
    <pre className="overflow-auto border border-hairline bg-stock-drift p-4 font-mono text-xs text-confirm">
      {content}
    </pre>
  );
}

function renderPackets(content: string) {
  return (
    <pre className="overflow-auto border border-hairline bg-stock-drift p-4 font-mono text-xs text-seal-ink">
      {content}
    </pre>
  );
}

function renderText(content: string) {
  return (
    <pre className="overflow-auto whitespace-pre-wrap border border-hairline bg-stock-drift p-4 font-mono text-xs text-ink-soft">
      {content}
    </pre>
  );
}

export function EvidenceViewer({ item }: EvidenceViewerProps) {
  if (!item) {
    return (
      <div className="plate flex h-full items-center justify-center p-6">
        <span className="register">Select an exhibit to view</span>
      </div>
    );
  }

  const Icon = kindIcons[item.kind] ?? FileText;

  return (
    <div className="plate flex h-full flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
        <Icon className="h-5 w-5 text-seal-ink" />
        <h4 className="font-semibold text-ink">{item.title}</h4>
        <span className="plate-id ml-auto">{item.kind}</span>
      </div>
      {item.description && (
        <p className="mb-3 text-sm text-ink-soft">{item.description}</p>
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
